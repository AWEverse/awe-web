import sodium from 'libsodium-wrappers';
import type { CryptoKeyPair, PublicKey, PrivateKey } from '../types';

/**
 * High-assurance Ed25519 digital signature operations using libsodium
 *
 * • RFC8032-compliant
 * • Uses libsodium-wrappers-sumo (WASM-backed)
 * • Suitable for secure protocols (X3DH, X3DH+PQ, etc.)
 */
export class Ed25519 {
  /**
   * Generates a new Ed25519 key pair.
   * @returns {CryptoKeyPair} Object containing a 32-byte public and private key.
   */
  static generateKeyPair(): CryptoKeyPair {
    const { publicKey, privateKey } = sodium.crypto_sign_keypair();

    return {
      publicKey: publicKey.subarray(0, 32) as PublicKey,
      privateKey: privateKey.subarray(0, 32) as PrivateKey, // only the seed
    };
  }

  /**
   * Derives the Ed25519 public key from a 32-byte private seed.
   * @param privateKey 32-byte seed private key.
   * @returns {PublicKey} Derived 32-byte public key.
   */
  static getPublicKey(privateKey: PrivateKey): PublicKey {
    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) {
      throw new TypeError('Invalid Ed25519 private key. Must be 32 bytes.');
    }

    const { publicKey } = sodium.crypto_sign_seed_keypair(privateKey);
    return publicKey as PublicKey;
  }

  /**
   * Signs a message using Ed25519 with the private seed key.
   * @param message The message to sign.
   * @param privateKey 32-byte seed private key.
   * @returns {Uint8Array} 64-byte signature.
   */
  static sign(message: Uint8Array, privateKey: PrivateKey): Uint8Array {
    if (!(message instanceof Uint8Array)) {
      throw new TypeError('Message must be a Uint8Array');
    }

    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) {
      throw new TypeError('Invalid Ed25519 private key. Must be 32 bytes.');
    }

    const { privateKey: fullPrivateKey } = sodium.crypto_sign_seed_keypair(privateKey);
    return sodium.crypto_sign_detached(message, fullPrivateKey);
  }

  /**
   * Verifies a detached Ed25519 signature.
   * @param signature 64-byte signature.
   * @param message Original message that was signed.
   * @param publicKey 32-byte public key.
   * @returns {boolean} true if the signature is valid, false otherwise.
   */
  static verify(signature: Uint8Array, message: Uint8Array, publicKey: PublicKey): boolean {
    if (
      !(signature instanceof Uint8Array) || signature.length !== 64 ||
      !(publicKey instanceof Uint8Array) || publicKey.length !== 32 ||
      !(message instanceof Uint8Array)
    ) {
      return false;
    }

    try {
      return sodium.crypto_sign_verify_detached(signature, message, publicKey);
    } catch {
      return false;
    }
  }
}
