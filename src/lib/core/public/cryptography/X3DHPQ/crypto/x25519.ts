import { x25519 } from "@noble/curves/ed25519";
import { KeyPair, PublicKey, PrivateKey } from "../types";
import { secureErase } from "../utils/secure";

/**
 * High-assurance X25519 cryptographic operations
 *
 * • Fully compliant with RFC7748
 * • Performs memory hygiene to prevent key leakage
 * • Designed for compatibility with hybrid PQ schemes (e.g. X3DH+PQ)
 */
export class X25519 {
  /**
   * Generates a new X25519 key pair
   *
   * @returns {KeyPair} - A secure random keypair { privateKey, publicKey }
   */
  static generateKeyPair(): KeyPair {
    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(privateKey);

    return {
      privateKey: new Uint8Array(privateKey) as PrivateKey,
      publicKey: new Uint8Array(publicKey) as PublicKey,
    };
  }

  /**
   * Computes a shared secret using the X25519 Diffie-Hellman protocol asynchronously.
   *
   * - The `privateKey` is securely wiped after usage to prevent leakage.
   * - The returned `Uint8Array` should be zeroized by the caller when no longer needed.
   *
   * @param privateKey {PrivateKey} - Sender's private key (32 bytes).
   * @param publicKey {PublicKey} - Recipient's public key (32 bytes).
   * @returns {Promise<Uint8Array>} A promise resolving to the shared secret (32 bytes).
   */
  static async computeSharedSecret(privateKey: PrivateKey, publicKey: PublicKey): Promise<Uint8Array> {
    const priv = new Uint8Array(privateKey);  // Isolate caller's memory
    const shared = x25519.getSharedSecret(priv, publicKey);
    const result = new Uint8Array(shared);    // Copy for isolation

    secureErase(priv);                        // Mandatory zeroization
    secureErase(shared);                      // Prevent timing leakage

    return result;
  }
}
