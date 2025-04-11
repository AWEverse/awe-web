import { ed25519 } from '@noble/curves/ed25519';
import type { KeyPair, PublicKey, PrivateKey } from '../types';

export class Ed25519 {
  /**
   * Generates a new Ed25519 key pair.
   * @returns {KeyPair} An object with publicKey and privateKey.
   */
  static generateKeyPair(): KeyPair {
    const privateKey = ed25519.utils.randomPrivateKey() as PrivateKey;
    const publicKey = this.getPublicKey(privateKey);

    return {
      privateKey: new Uint8Array(privateKey) as PrivateKey,
      publicKey: new Uint8Array(publicKey) as PublicKey,
    };
  }

  /**
   * Derives the public key from a given private key.
   * @param privateKey Ed25519 private key (32 bytes).
   * @returns {PublicKey} Corresponding public key (32 bytes).
   */
  static getPublicKey(privateKey: PrivateKey): PublicKey {
    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) {
      throw new Error('Invalid private key');
    }

    return ed25519.getPublicKey(privateKey) as PublicKey;
  }

  /**
   * Signs a message with the given Ed25519 private key.
   * @param message Message to be signed.
   * @param privateKey 32-byte private key.
   * @returns Signature as a 64-byte Uint8Array.
   */
  static sign(message: Uint8Array, privateKey: PrivateKey): Uint8Array {
    if (!(message instanceof Uint8Array)) {
      throw new TypeError('Message must be Uint8Array');
    }

    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) {
      throw new Error('Invalid private key');
    }

    return ed25519.sign(message, privateKey);
  }

  /**
   * Verifies a signature against a message and a public key.
   * @param signature 64-byte Ed25519 signature.
   * @param message Original message that was signed.
   * @param publicKey 32-byte public key.
   * @returns true if signature is valid, false otherwise.
   */
  static verify(signature: Uint8Array, message: Uint8Array, publicKey: PublicKey): boolean {
    if (
      !(signature instanceof Uint8Array) || signature.length !== 64 ||
      !(publicKey instanceof Uint8Array) || publicKey.length !== 32
    ) {
      return false;
    }
    try {
      return ed25519.verify(signature, message, publicKey);
    } catch {
      return false;
    }
  }

}
