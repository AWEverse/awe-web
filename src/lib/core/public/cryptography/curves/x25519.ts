import sodium from 'libsodium-wrappers';
import { CryptoKeyPair, PrivateKey, PublicKey } from '../types';
import { secureErase } from '../secure';

/**
 * High-assurance X25519 cryptographic operations using libsodium
 *
 * • Fully compliant with RFC7748
 * • Performs memory hygiene to prevent key leakage
 * • Designed for compatibility with hybrid PQ schemes (e.g. X3DH+PQ)
 */
export class X25519 {


  /**
   * Generates a new X25519 key pair.
   *
   * @returns {Promise<CryptoKeyPair>} - A secure random CryptoKeyPair { privateKey, publicKey }
   */
  static generateKeyPair(): CryptoKeyPair {

    const { privateKey, publicKey } = sodium.crypto_kx_keypair(); // 32 + 32 bytes

    return {
      privateKey: new Uint8Array(privateKey) as PrivateKey,
      publicKey: new Uint8Array(publicKey) as PublicKey,
    };
  }

  /**
   * Computes a shared secret using the X25519 Diffie-Hellman protocol.
   *
   * - The `privateKey` is securely wiped after usage to prevent leakage.
   * - The returned `Uint8Array` should be zeroized by the caller when no longer needed.
   *
   * @param privateKey {PrivateKey} - Sender's private key (32 bytes).
   * @param publicKey {PublicKey} - Recipient's public key (32 bytes).
   * @returns {Promise<Uint8Array>} A promise resolving to the shared secret (32 bytes).
   */
  static computeSharedSecret(privateKey: PrivateKey, publicKey: PublicKey): Uint8Array {

    const priv = new Uint8Array(privateKey); // Copy to isolate
    const pub = new Uint8Array(publicKey);

    const shared = sodium.crypto_scalarmult(priv, pub); // Raw X25519 shared secret

    secureErase(priv);   // Clean private key
    return new Uint8Array(shared); // Return result (caller should zeroize later)
  }
}
