/**
 * A public key represented as a branded Uint8Array.
 * Used in cryptographic operations like key exchange (X25519, ML-KEM) or signature verification (Ed25519).
 * @remarks
 * - Must be validated for correct length and format by the specific algorithm (e.g., 32 bytes for X25519).
 * - Should be shared publicly but never stored insecurely.
 */
export type PublicKey = Brand<Uint8Array, "CryptoPublicKey">;

/**
 * A private key represented as a branded Uint8Array.
 * Used in cryptographic operations like signing (Ed25519), key exchange (X25519), or decapsulation (ML-KEM).
 * @remarks
 * - Must be kept secret and erased securely after use (e.g., using `secureErase`).
 * - Typically larger than public keys for ML-KEM (e.g., ~1632 bytes for ML-KEM-512).
 */
export type PrivateKey = Brand<Uint8Array, "CryptoPrivateKey">;

/**
 * A cryptographic key pair consisting of a public key and a private key.
 * Used in operations like key exchange (e.g., X25519), signing (e.g., Ed25519), or encapsulation (e.g., ML-KEM).
 * @remarks
 * - The public key can be shared openly but must be validated for correct length/format by the algorithm.
 * - The private key must remain secret, stored securely, and erased after use (e.g., via `secureErase`).
 * - Ensure the key pair is generated for a specific algorithm to avoid misuse (e.g., X25519 vs. Ed25519).
 */
export interface CryptoKeyPair {
  /** The public key, safe to share but must be validated (e.g., 32 bytes for X25519). */
  publicKey: PublicKey;
  /** The private key, must be kept secret and securely erased after use. */
  privateKey: PrivateKey;
}

export type CurveHex = string | Uint8Array<ArrayBufferLike>;


export interface EncapsulatePair {
  sharedSecret: Uint8Array;
  cipherText: Uint8Array;
}
