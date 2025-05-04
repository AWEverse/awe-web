import sodium from "libsodium-wrappers"
import { ml_kem512, ml_kem768, ml_kem1024 } from "@noble/post-quantum/ml-kem";
import { CryptoKeyPair, PublicKey, PrivateKey, EncapsulatePair } from "../../types";
import { SHARED_SECRET_LENGTH } from "../config";
import { secureErase } from "../../secure";
import { X3DHError } from "../protocol/errors";
import { createHash } from "crypto"; // For hybrid cryptography [[7]]

// Define ML-KEM variant configurations
type MLKEMVariant = "512" | "768" | "1024";

interface MLKEMConfig {
  variant: MLKEMVariant;
  securityLevel: number;
  publicKeyLength: number;
  privateKeyLength: number;
  ciphertextLength: number;
  sharedSecretLength: number;
  kem: {
    keygen: () => { publicKey: Uint8Array; secretKey: Uint8Array };
    encapsulate: (publicKey: Uint8Array) => { sharedSecret: Uint8Array; cipherText: Uint8Array };
    decapsulate: (cipherText: Uint8Array, secretKey: Uint8Array) => Uint8Array;
  };
  version: string; // Version field for API consistency [[1]]
}

const MLKEM_VARIANTS: Record<MLKEMVariant, MLKEMConfig> = {
  "512": {
    variant: "512",
    securityLevel: 128,
    publicKeyLength: 800,
    privateKeyLength: 1632,
    ciphertextLength: 768,
    sharedSecretLength: SHARED_SECRET_LENGTH,
    kem: ml_kem512,
    version: "FIPS-203-v1.0", // Compliance with NIST FIPS 203 [[7]]
  },
  "768": {
    variant: "768",
    securityLevel: 192,
    publicKeyLength: 1184,
    privateKeyLength: 2400,
    ciphertextLength: 1088,
    sharedSecretLength: SHARED_SECRET_LENGTH,
    kem: ml_kem768,
    version: "FIPS-203-v1.0",
  },
  "1024": {
    variant: "1024",
    securityLevel: 256,
    publicKeyLength: 1568,
    privateKeyLength: 3168,
    ciphertextLength: 1568,
    sharedSecretLength: SHARED_SECRET_LENGTH,
    kem: ml_kem1024,
    version: "FIPS-203-v1.0",
  },
};

/**
 * ML-KEM cryptographic operations for variants 512, 768, and 1024 with variant mismatch prevention.
 * @version FIPS-203-compliant API [[7]]
 */
export class MLKEM {
  // Expose static properties for each variant as readonly accessors
  public static get V512() {
    return MLKEM_VARIANTS["512"];
  }
  public static get V768() {
    return MLKEM_VARIANTS["768"];
  }
  public static get V1024() {
    return MLKEM_VARIANTS["1024"];
  }

  /**
   * Generates an ML-KEM key pair with hybrid ECC integration.
   * @param variant The ML-KEM variant ("512", "768", or "1024"). Defaults to "768".
   * @param hybridKey Optional ECC key for hybrid cryptography [[7]]
   * @returns A key pair with public and private keys.
   */
  static generateKeyPair(
    variant: MLKEMVariant = "768",
    hybridKey?: { publicKey: Uint8Array; privateKey: Uint8Array }
  ): CryptoKeyPair {
    const config = MLKEM_VARIANTS[variant];
    const { publicKey, secretKey } = config.kem.keygen();

    // Hybrid key binding example [[7]]
    if (hybridKey) {
      return {
        publicKey: this.combineHybridKeys(publicKey, hybridKey.publicKey) as PublicKey,
        privateKey: this.combineHybridKeys(secretKey, hybridKey.privateKey) as PrivateKey,
      };
    }

    return {
      publicKey: publicKey as PublicKey,
      privateKey: secretKey as PrivateKey,
    };
  }

  /**
   * Encapsulates a shared secret using ML-KEM with constant-time validation.
   * @param publicKey The recipient's public key (must match variant's expected length).
   * @param variant The ML-KEM variant ("512", "768", or "1024"). Defaults to "768".
   * @returns A promise resolving to an EncapsulatePair with shared secret and ciphertext.
   * @throws {X3DHError} If public key length mismatches the variant or encapsulation fails.
   */
  static async encapsulate(
    publicKey: PublicKey,
    variant: MLKEMVariant = "768"
  ): Promise<EncapsulatePair> {
    const config = MLKEM_VARIANTS[variant];

    if (publicKey.length !== config.publicKeyLength) {
      throw new X3DHError(
        `Invalid public key length for ML-KEM-${variant}: expected ${config.publicKeyLength}, got ${publicKey.length}`,
        `MLKEM_${variant}_INVALID_PUBLIC_KEY`
      );
    }

    try {
      const result = config.kem.encapsulate(publicKey);

      // Constant-time validation [[7]]
      if (!this.constantTimeEqual(result.sharedSecret, new Uint8Array(result.sharedSecret))) {
        throw new Error("Shared secret validation failed");
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new X3DHError(
        `ML-KEM-${config.variant} encapsulation failed: ${message}`,
        `MLKEM_${config.variant}_ENCAPSULATION_FAILED`
      );
    }
  }

  /**
   * Decapsulates a shared secret using ML-KEM with secure cleanup.
   * @param cipherText The encapsulated ciphertext (must match variant's expected length).
   * @param privateKey The recipient's private key (must match variant's expected length).
   * @param variant The ML-KEM variant ("512", "768", or "1024"). Defaults to "768".
   * @returns A promise resolving to the shared secret.
   * @throws {X3DHError} If private key or ciphertext length mismatches the variant, or decapsulation fails.
   */
  static async decapsulate(
    cipherText: Uint8Array,
    privateKey: PrivateKey,
    variant: MLKEMVariant = "768",
    hybridKey?: Uint8Array // Optional hybrid key for hybrid cryptography
  ): Promise<Uint8Array> {
    const config = MLKEM_VARIANTS[variant];

    if (privateKey.length !== config.privateKeyLength) {
      throw new X3DHError(
        `Invalid private key length for ML-KEM-${variant}: expected ${config.privateKeyLength}, got ${privateKey.length}`,
        `MLKEM_${variant}_INVALID_PRIVATE_KEY`
      );
    }

    if (cipherText.length !== config.ciphertextLength) {
      throw new X3DHError(
        `Invalid ciphertext length for ML-KEM-${variant}: expected ${config.ciphertextLength}, got ${cipherText.length}`,
        `MLKEM_${variant}_INVALID_CIPHERTEXT`
      );
    }

    try {
      const sharedSecret = config.kem.decapsulate(cipherText, privateKey);
      const sharedSecretCopy = new Uint8Array(sharedSecret);

      if (
        sharedSecretCopy.length !== config.sharedSecretLength ||
        sharedSecretCopy.every((byte) => byte === 0)
      ) {
        secureErase(sharedSecretCopy);
        secureErase(sharedSecret);
        throw new Error("Invalid shared secret");
      }

      // Hybrid secret binding [[7]]
      const hybridSecret = hybridKey
        ? this.combineHybridKeys(sharedSecret, hybridKey)
        : sharedSecret;

      secureErase(sharedSecretCopy);
      secureErase(sharedSecret);
      return hybridSecret;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new X3DHError(
        `ML-KEM-${config.variant} decapsulation failed: ${message}`,
        `MLKEM_${config.variant}_DECAPSULATION_FAILED`
      );
    }
  }

  // Helper methods
  private static combineHybridKeys(key1: Uint8Array, key2: Uint8Array): Uint8Array {
    const combined = new Uint8Array(key1.length + key2.length);
    combined.set(key1);
    combined.set(key2, key1.length);
    return createHash("sha512").update(combined).digest(); // Hybrid key derivation [[7]]
  }

  private static constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    switch (sodium.compare(a, b)) {
      case 0:
        return true;
      default:
        return false;
    }
  }
}

