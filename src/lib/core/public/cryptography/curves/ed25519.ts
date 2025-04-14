import sodium from 'libsodium-wrappers';
import type { CryptoKeyPair, PublicKey, PrivateKey } from '../types';

/**
 * High-assurance Ed25519 digital signature operations using libsodium
 *
 * • Complies with RFC8032 (Ed25519)
 * • Uses libsodium-wrappers-sumo (WebAssembly-based, secure)
 * • Ideal for integration into secure protocols (e.g. X3DH, X3DH+PQ)
 */
export class Ed25519 {


  /**
   * Generates a new Ed25519 key pair.
   * @returns {Promise<CryptoKeyPair>} An object with publicKey and privateKey (both 32 bytes).
   */
  static generateKeyPair(): CryptoKeyPair {

    const { publicKey, privateKey } = sodium.crypto_sign_keypair();

    const privateKey32 = privateKey.subarray(0, 32);
    return {
      publicKey: new Uint8Array(publicKey) as PublicKey,
      privateKey: new Uint8Array(privateKey32) as PrivateKey,
    };
  }

  /**
   * Derives the public key from a given private key.
   * @param privateKey Ed25519 private key (32-byte seed).
   * @returns {Promise<PublicKey>} Corresponding public key (32 bytes).
   */
  static getPublicKey(privateKey: PrivateKey): PublicKey {

    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) {
      throw new Error('Invalid private key');
    }

    const keyPair = sodium.crypto_sign_seed_keypair(privateKey);
    return new Uint8Array(keyPair.publicKey) as PublicKey;
  }

  /**
   * Signs a message with the given Ed25519 private key.
   * @param message Message to be signed.
   * @param privateKey 32-byte seed private key.
   * @returns {Uint8Array} Signature (64 bytes).
   */
  static sign(message: Uint8Array, privateKey: PrivateKey): Uint8Array {

    if (!(message instanceof Uint8Array)) {
      throw new TypeError('Message must be Uint8Array');
    }

    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) {
      throw new Error('Invalid private key');
    }

    const fullPrivKey = sodium.crypto_sign_seed_keypair(privateKey).privateKey;
    const signature = sodium.crypto_sign_detached(message, fullPrivKey);

    return new Uint8Array(signature);
  }

  /**
   * Verifies a signature against a message and a public key.
   * @param signature 64-byte Ed25519 signature.
   * @param message Message that was signed.
   * @param publicKey 32-byte public key.
   * @returns {Uint8Array} true if signature is valid, false otherwise.
   */
  static verify(signature: Uint8Array, message: Uint8Array, publicKey: PublicKey): boolean {

    if (
      !(signature instanceof Uint8Array) || signature.length !== 64 ||
      !(publicKey instanceof Uint8Array) || publicKey.length !== 32
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
