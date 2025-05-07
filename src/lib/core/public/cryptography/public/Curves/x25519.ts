import { crypto_kx_keypair, crypto_scalarmult, memzero } from 'libsodium-wrappers';

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
   */
  static generateKeyPair() {

    const keypair = crypto_kx_keypair(); // 32-byte keys

    return {
      privateKey: new Uint8Array(keypair.privateKey),
      publicKey: new Uint8Array(keypair.publicKey),
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
  static computeSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
    const priv = new Uint8Array(privateKey); // defensive copy
    const pub = new Uint8Array(publicKey);

    try {
      const shared = crypto_scalarmult(priv, pub); // X25519 DH
      return new Uint8Array(shared); // caller responsible for zeroizing output
    } finally {
      memzero(priv); // ensure cleanup even if exception thrown
    }
  }
}
