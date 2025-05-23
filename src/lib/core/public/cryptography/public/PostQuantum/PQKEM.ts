import sodium from "libsodium-wrappers";
import { ml_kem512, ml_kem768, ml_kem1024 } from "@noble/post-quantum/ml-kem";

export type Curve = "curve25519";
export type TPQKEM = "ml-kem-512" | "ml-kem-768" | "ml-kem-1024";
export type HybridMode = "concat" | "xor" | "hkdf";

export interface CryptoKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface PQKEMParameters {
  curve: Curve;
  kem: TPQKEM;
  hash: "SHA-256" | "SHA-512";
  hybridMode: HybridMode;
  keyLength: number;
}

export class X3DHError extends Error {
  constructor(message: string, code: string) {
    super(message);
    this.name = "X3DHError";
    this.code = code;
  }
  code: string;
}

interface MLKEMConfig {
  keygen: () => { publicKey: Uint8Array; secretKey: Uint8Array };
  encapsulate: (pk: Uint8Array) => { sharedSecret: Uint8Array; cipherText: Uint8Array };
  decapsulate: (ct: Uint8Array, sk: Uint8Array) => Uint8Array;
  publicKeyLength: number;
  privateKeyLength: number;
  ciphertextLength: number;
}

const MLKEM_CONFIGS: Record<TPQKEM, MLKEMConfig> = {
  "ml-kem-512": {
    keygen: ml_kem512.keygen,
    encapsulate: ml_kem512.encapsulate,
    decapsulate: ml_kem512.decapsulate,
    publicKeyLength: 800,
    privateKeyLength: 1632,
    ciphertextLength: 768,
  },
  "ml-kem-768": {
    keygen: ml_kem768.keygen,
    encapsulate: ml_kem768.encapsulate,
    decapsulate: ml_kem768.decapsulate,
    publicKeyLength: 1184,
    privateKeyLength: 2400,
    ciphertextLength: 1088,
  },
  "ml-kem-1024": {
    keygen: ml_kem1024.keygen,
    encapsulate: ml_kem1024.encapsulate,
    decapsulate: ml_kem1024.decapsulate,
    publicKeyLength: 1568,
    privateKeyLength: 3168,
    ciphertextLength: 1568,
  },
};

const SCALAR_BYTES = 32;
const INFO_STRING = "hybrid-kem-v1";

export class PQKEM {
  private static getConfig(kem: TPQKEM): MLKEMConfig {
    return MLKEM_CONFIGS[kem] || MLKEM_CONFIGS["ml-kem-512"];
  }

  // Clamp the private key for Curve25519
  private static clampScalar(scalar: Uint8Array): Uint8Array {
    const clamped = new Uint8Array(scalar);
    clamped[0] &= 248; // Clear low 3 bits
    clamped[31] &= 127; // Clear highest bit
    clamped[31] |= 64; // Set second highest bit
    return clamped;
  }

  private static deriveSharedSecret(
    config: PQKEMParameters,
    eccSecret: Uint8Array,
    pqSecret: Uint8Array,
  ): Uint8Array {
    switch (config.hybridMode) {
      case "concat":
        const hashLength = config.hash === "SHA-512" ? 64 : 32;
        const state = sodium.crypto_generichash_init(null, hashLength);
        sodium.crypto_generichash_update(state, eccSecret);
        sodium.crypto_generichash_update(state, pqSecret);
        return sodium.crypto_generichash_final(state, hashLength);
      case "xor":
        if (eccSecret.length !== pqSecret.length) throw new X3DHError("Key length mismatch", "KEY_LENGTH_MISMATCH");
        const combined = new Uint8Array(eccSecret.length);
        for (let i = 0; i < eccSecret.length; i++) combined[i] = eccSecret[i] ^ pqSecret[i];
        return this.hash(config.hash, combined);
      case "hkdf":
        return this.hkdf(eccSecret, pqSecret, config.keyLength);
      default:
        throw new X3DHError("Invalid hybrid mode", "INVALID_MODE");
    }
  }

  static encapsulate(
    config: PQKEMParameters,
    recipientPublicKey: { ecc: Uint8Array; pqkem: Uint8Array },
    ephemeralKey?: Uint8Array,
  ): { ciphertext: Uint8Array; sharedSecret: Uint8Array; ephemeralPublicKey: Uint8Array } {
    const configKem = this.getConfig(config.kem);
    const ephemeralPrivateKeyRaw = ephemeralKey || sodium.randombytes_buf(SCALAR_BYTES);
    const ephemeralPrivateKey = this.clampScalar(ephemeralPrivateKeyRaw);
    const ephemeralPublicKey = sodium.crypto_scalarmult_base(ephemeralPrivateKey);
    const eccSecret = sodium.crypto_scalarmult(ephemeralPrivateKey, recipientPublicKey.ecc);
    const { sharedSecret: pqSecret, cipherText } = configKem.encapsulate(recipientPublicKey.pqkem);
    const hybridSecret = this.deriveSharedSecret(config, eccSecret, pqSecret);

    sodium.memzero(eccSecret);
    sodium.memzero(pqSecret);

    return { ciphertext: cipherText, sharedSecret: hybridSecret, ephemeralPublicKey };
  }

  static decapsulate(
    config: PQKEMParameters,
    ciphertext: Uint8Array,
    recipientKey: { eccPrivateKey: Uint8Array; pqkemPrivateKey: Uint8Array },
    senderPublicKey: Uint8Array,
  ): Uint8Array {
    const configKem = this.getConfig(config.kem);
    if (ciphertext.length !== configKem.ciphertextLength || recipientKey.pqkemPrivateKey.length !== configKem.privateKeyLength) {
      throw new X3DHError(`Invalid key/ciphertext length for ${config.kem}`, "INVALID_LENGTH");
    }
    const eccSecret = sodium.crypto_scalarmult(recipientKey.eccPrivateKey, senderPublicKey);
    const pqSecret = configKem.decapsulate(ciphertext, recipientKey.pqkemPrivateKey);
    const hybridSecret = this.deriveSharedSecret(config, eccSecret, pqSecret);

    sodium.memzero(eccSecret);
    sodium.memzero(pqSecret);

    return hybridSecret;
  }

  private static hkdf(eccSecret: Uint8Array, pqSecret: Uint8Array, length: number): Uint8Array {
    const hashLength = 32; // Fixed for key derivation
    const state = sodium.crypto_generichash_init(null, hashLength);
    sodium.crypto_generichash_update(state, eccSecret);
    sodium.crypto_generichash_update(state, pqSecret);
    const key = sodium.crypto_generichash_final(state, hashLength);
    return sodium.crypto_kdf_derive_from_key(length, 1, INFO_STRING, key);
  }

  private static hash(hash: string, data: Uint8Array): Uint8Array {
    const hashLength = hash === "SHA-512" ? 64 : 32;
    return sodium.crypto_generichash(hashLength, data);
  }
}
