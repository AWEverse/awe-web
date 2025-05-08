import {
  crypto_sign_keypair,
  crypto_sign_detached,
  crypto_sign_verify_detached,
  randombytes_buf,
  crypto_sign_seed_keypair
} from "libsodium-wrappers";
import { CONSTANTS } from "../utils/cryptoUtils";


/**
 * High-assurance Ed25519 digital signature operations using lib
 *
 * • RFC8032-compliant
 * • Uses lib-wrappers-sumo (WASM-backed)
 * • Suitable for secure protocols (X3DH, X3DH+PQ, etc.)
 */
export class Ed25519 {
  /**
   * Generates a new Ed25519 key pair.
   * @returns {CryptoKeyPair} Object containing a 32-byte public and private key.
   */
  static generateKeyPair() {
    const { publicKey, privateKey } = crypto_sign_keypair();

    return {
      publicKey: publicKey.subarray(0, 32),
      privateKey: privateKey.subarray(0, 32), // only the seed
    };
  }

  /**
   * Signs a message using Ed25519 with the private seed key.
   * @param message The message to sign.
   * @param privateKey 32-byte seed private key.
   * @returns {Uint8Array} 64-byte signature.
   */
  static sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
    if (!(message instanceof Uint8Array)) {
      throw new TypeError('Message must be a Uint8Array');
    }

    if (privateKey.length !== 32) {
      throw new TypeError('Invalid Ed25519 private key. Must be 32 bytes.');
    }

    const { privateKey: fullPrivateKey } = crypto_sign_seed_keypair(privateKey);
    return crypto_sign_detached(message, fullPrivateKey);
  }

  /**
   * Verifies a detached Ed25519 signature.
   * @param signature 64-byte signature.
   * @param message Original message that was signed.
   * @param publicKey 32-byte public key.
   * @returns {boolean} true if the signature is valid, false otherwise.
   */
  static verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean {
    if (
      signature.length !== 64 ||
      publicKey.length !== 32 ||
      !(message instanceof Uint8Array)
    ) {
      return false;
    }

    try {
      return crypto_sign_verify_detached(signature, message, publicKey);
    } catch {
      return false;
    }
  }

  /**
   * Generates a random seed for key generation
   * @returns 32-byte random seed
   */
  public static generateSeed(): Uint8Array {
    return randombytes_buf(CONSTANTS.KEY_LENGTH);
  }
}
