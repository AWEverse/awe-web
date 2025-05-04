import sodium from "libsodium-wrappers";
import { ml_kem512, ml_kem768, ml_kem1024 } from "@noble/post-quantum/ml-kem";

export type Curve = "curve25519" | "curve448";
export type PQKEM = "ml-kem-512" | "ml-kem-768" | "ml-kem-1024";
export type HybridMode = "concat" | "xor" | "hkdf";

export interface CryptoKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface PQXDHParameters {
  curve: Curve;
  kem: PQKEM;
  hash: "SHA-256" | "SHA-384" | "SHA-512";
  hybridMode: HybridMode;
  keyLength: number;
  kemContext: string;
}

export class X3DHError extends Error {
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, X3DHError.prototype);
  }
  code: string;
}

type MLKEMConfig = {
  keygen: () => { publicKey: Uint8Array; secretKey: Uint8Array };
  encapsulate: (pk: Uint8Array) => { sharedSecret: Uint8Array; cipherText: Uint8Array };
  decapsulate: (ct: Uint8Array, sk: Uint8Array) => Uint8Array;
  publicKeyLength: number;
  privateKeyLength: number;
  ciphertextLength: number;
};

const getMLKEMConfigs = ((key: string) => {
  return (): MLKEMConfig => {
    switch (key) {
      case "ml-kem-512":
      default:
        return {
          keygen: ml_kem512.keygen,
          encapsulate: ml_kem512.encapsulate,
          decapsulate: ml_kem512.decapsulate,
          publicKeyLength: 800,
          privateKeyLength: 1632,
          ciphertextLength: 768,

        }
      case "ml-kem-768":
        return {
          keygen: ml_kem768.keygen,
          encapsulate: ml_kem768.encapsulate,
          decapsulate: ml_kem768.decapsulate,
          publicKeyLength: 1184,
          privateKeyLength: 2400,
          ciphertextLength: 1088,
        }
      case "ml-kem-1024":
        return {
          keygen: ml_kem1024.keygen,
          encapsulate: ml_kem1024.encapsulate,
          decapsulate: ml_kem1024.decapsulate,
          publicKeyLength: 1568,
          privateKeyLength: 3168,
          ciphertextLength: 1568,
        }
    }
  };
})("ml-kem-512");

/**
 * Generalized Post-Quantum Hybrid Key Exchange System
 */
export class PQXDH {
  private static config: MLKEMConfig = getMLKEMConfigs();

  /**
   * Generate hybrid key pair (ECC + PQ-KEM)
   */
  static async generateKeyPair(): Promise<{
    ecc: CryptoKeyPair;
    pqkem: CryptoKeyPair;
  }> {
    const eccPrivateKey = sodium.randombytes_buf(
      sodium.crypto_scalarmult_SCALARBYTES,
    );
    const eccPublicKey = sodium.crypto_scalarmult_base(eccPrivateKey);
    const { publicKey, secretKey } = PQXDH.config.keygen();

    return {
      ecc: { publicKey: eccPublicKey, privateKey: eccPrivateKey },
      pqkem: { publicKey, privateKey: secretKey },
    };
  }

  /**
   * Derive shared secret using hybrid approach
   */
  static async deriveSharedSecret(
    config: PQXDHParameters,
    eccSecret: Uint8Array,
    pqSecret: Uint8Array,
  ): Promise<Uint8Array> {
    let combined: Uint8Array;

    switch (config.hybridMode) {
      case "concat":
        combined = new Uint8Array([...eccSecret, ...pqSecret]);
        break;

      case "xor":
        if (eccSecret.length !== pqSecret.length) {
          throw new X3DHError("Key length mismatch", "KEY_LENGTH_MISMATCH");
        }

        combined = new Uint8Array(eccSecret.length);

        for (let i = 0; i < eccSecret.length; i++) {
          combined[i] = eccSecret[i] ^ pqSecret[i];
        }
        break;

      case "hkdf":
        const salt = await this.hash(
          config.hash,
          new TextEncoder().encode(config.kemContext),
        );
        combined = await this.hkdfExpand(
          config.hash,
          salt,
          eccSecret,
          pqSecret,
          config.keyLength,
        );
        break;

      default:
        throw new X3DHError("Invalid hybrid mode", "INVALID_MODE");
    }

    return this.hash(config.hash, combined);
  }

  /**
   * Encapsulate secret to recipient
   */
  static async encapsulate(
    config: PQXDHParameters,
    recipientPublicKey: { ecc: Uint8Array; pqkem: Uint8Array },
    ephemeralKey?: Uint8Array,
  ): Promise<{
    ciphertext: Uint8Array;
    sharedSecret: Uint8Array;
    ephemeralPublicKey: Uint8Array;
  }> {
    const ephemeralPrivateKey =
      ephemeralKey ||
      sodium.randombytes_buf(sodium.crypto_scalarmult_SCALARBYTES);
    const ephemeralPublicKey =
      sodium.crypto_scalarmult_base(ephemeralPrivateKey);
    const eccSecret = sodium.crypto_scalarmult(
      recipientPublicKey.ecc,
      ephemeralPrivateKey,
    );
    const { sharedSecret: pqSecret, cipherText } = PQXDH.config.encapsulate(recipientPublicKey.pqkem);

    const hybridSecret = await this.deriveSharedSecret(
      config,
      eccSecret,
      pqSecret,
    );

    sodium.memzero(eccSecret);
    sodium.memzero(pqSecret);

    return {
      ciphertext: cipherText,
      sharedSecret: hybridSecret,
      ephemeralPublicKey,
    };
  }

  /**
   * Decapsulate secret from sender
   */
  static async decapsulate(
    config: PQXDHParameters,
    ciphertext: Uint8Array,
    recipientKey: { eccPrivateKey: Uint8Array; pqkemPrivateKey: Uint8Array },
    senderPublicKey: Uint8Array,
  ): Promise<Uint8Array> {
    this.validateLengths(config, ciphertext, recipientKey.pqkemPrivateKey);
    const eccSecret = sodium.crypto_scalarmult(
      senderPublicKey,
      recipientKey.eccPrivateKey,
    );
    const pqSecret = PQXDH.config.decapsulate(
      ciphertext,
      recipientKey.pqkemPrivateKey,
    );
    const hybridSecret = await this.deriveSharedSecret(
      config,
      eccSecret,
      pqSecret,
    );

    sodium.memzero(eccSecret);
    sodium.memzero(pqSecret);

    return hybridSecret;
  }

  // Helper Methods
  private static async hkdfExpand(
    hash: string,
    salt: Uint8Array,
    eccSecret: Uint8Array,
    pqSecret: Uint8Array,
    length: number,
  ): Promise<Uint8Array> {
    const input = new Uint8Array([...eccSecret, ...pqSecret]);
    const key = await crypto.subtle.importKey(
      "raw",
      input,
      { name: "HKDF" },
      false,
      ["deriveBits"],
    );
    const derived = await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash,
        salt,
        info: new TextEncoder().encode("hybrid-kem-v1"),
      },
      key,
      length * 8,
    );
    return new Uint8Array(derived);
  }

  private static async hash(
    hash: string,
    data: Uint8Array,
  ): Promise<Uint8Array> {
    const result = await crypto.subtle.digest(hash, data);
    return new Uint8Array(result);
  }

  private static validateLengths(
    config: PQXDHParameters,
    ciphertext: Uint8Array,
    privateKey: Uint8Array,
  ): void {
    const k = PQXDH.config;

    if (
      ciphertext.length !== k.ciphertextLength ||
      privateKey.length !== k.privateKeyLength
    ) {
      throw new X3DHError(
        `Invalid key/ciphertext length for ${config.kem}`,
        "INVALID_LENGTH",
      );
    }
  }
}
