import { ml_kem512, ml_kem768, ml_kem1024 } from "@noble/post-quantum/ml-kem";
import { CryptoKeyPair, EncapsulatePair, PrivateKey, PublicKey } from "../types";
import { SHARED_SECRET_LENGTH } from "../config";
import { secureErase } from "../../secure";
import { X3DHError } from "../protocol/errors";

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
  },
  "768": {
    variant: "768",
    securityLevel: 192,
    publicKeyLength: 1184,
    privateKeyLength: 2400,
    ciphertextLength: 1088,
    sharedSecretLength: SHARED_SECRET_LENGTH,
    kem: ml_kem768,
  },
  "1024": {
    variant: "1024",
    securityLevel: 256,
    publicKeyLength: 1568,
    privateKeyLength: 3168,
    ciphertextLength: 1568,
    sharedSecretLength: SHARED_SECRET_LENGTH,
    kem: ml_kem1024,
  },
};

/**
 * ML-KEM cryptographic operations for variants 512, 768, and 1024 with variant mismatch prevention.
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
   * Generates an ML-KEM key pair for the specified variant.
   * @param variant The ML-KEM variant ("512", "768", or "1024"). Defaults to "768".
   * @returns A key pair with public and private keys.
   */
  static generateKeyPair(variant: MLKEMVariant = "768"): CryptoKeyPair {
    const config = MLKEM_VARIANTS[variant];
    const { publicKey, secretKey } = config.kem.keygen();
    return {
      publicKey: publicKey as PublicKey,
      privateKey: secretKey as PrivateKey,
    };
  }

  /**
   * Encapsulates a shared secret using ML-KEM for the specified variant.
   * @param publicKey The recipient's public key (must match variant's expected length).
   * @param variant The ML-KEM variant ("512", "768", or "1024"). Defaults to "768".
   * @returns A promise resolving to an EncapsulatePair with shared secret and ciphertext.
   * @throws {X3DHError} If public key length mismatches the variant or encapsulation fails.
   */
  static async encapsulate(publicKey: PublicKey, variant: MLKEMVariant = "768"): Promise<EncapsulatePair> {
    const config = MLKEM_VARIANTS[variant];

    // Validate public key length
    if (publicKey.length !== config.publicKeyLength) {
      throw new X3DHError(
        `Invalid public key length for ML-KEM-${variant}: expected ${config.publicKeyLength}, got ${publicKey.length}`,
        `MLKEM_${variant}_INVALID_PUBLIC_KEY`
      );
    }

    try {
      return config.kem.encapsulate(publicKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new X3DHError(
        `ML-KEM-${config.variant} encapsulation failed: ${message}`,
        `MLKEM_${config.variant}_ENCAPSULATION_FAILED`
      );
    }
  }

  /**
   * Decapsulates a shared secret using ML-KEM for the specified variant.
   * @param cipherText The encapsulated ciphertext (must match variant's expected length).
   * @param privateKey The recipient's private key (must match variant's expected length).
   * @param variant The ML-KEM variant ("512", "768", or "1024"). Defaults to "768".
   * @returns A promise resolving to the shared secret.
   * @throws {X3DHError} If private key or ciphertext length mismatches the variant, or decapsulation fails.
   */
  static async decapsulate(
    cipherText: Uint8Array,
    privateKey: PrivateKey,
    variant: MLKEMVariant = "768"
  ): Promise<Uint8Array> {
    const config = MLKEM_VARIANTS[variant];

    // Validate private key length
    if (privateKey.length !== config.privateKeyLength) {
      throw new X3DHError(
        `Invalid private key length for ML-KEM-${variant}: expected ${config.privateKeyLength}, got ${privateKey.length}`,
        `MLKEM_${variant}_INVALID_PRIVATE_KEY`
      );
    }

    // Validate ciphertext length
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

      secureErase(sharedSecretCopy);
      return sharedSecret;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new X3DHError(
        `ML-KEM-${config.variant} decapsulation failed: ${message}`,
        `MLKEM_${config.variant}_DECAPSULATION_FAILED`
      );
    }
  }
}
