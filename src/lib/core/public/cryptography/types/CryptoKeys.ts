/**
 * A cryptographic key pair consisting of a public key and a private key.
 * Used in operations like key exchange (e.g., X25519), signing (e.g., Ed25519), or encapsulation (e.g., ML-KEM).
 * @remarks
 * - The public key can be shared openly but must be validated for correct length/format by the algorithm.
 * - The private key must remain secret, stored securely, and erased after use (e.g., via `secureErase`).
 * - Ensure the key pair is generated for a specific algorithm to avoid misuse (e.g., X25519 vs. Ed25519).
 */
export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export type CurveHex = string | Uint8Array<ArrayBufferLike>;

export type PqEncapsulation = {
  ciphertext: Uint8Array;
  sharedSecret: Uint8Array;
};


export type InitialMessage = {
  senderIdentityKeyX25519: Uint8Array;
  ephemeralKeyEC: Uint8Array;
  pqEncapsulations: {
    identity: Uint8Array; // Ciphertext from IK_A → IK_B
    signedPreKey: Uint8Array; // Ciphertext from EK_A → SPK_B
    oneTimePreKey?: Uint8Array | null; // Optional OPK_B encapsulation
  };
};

export type SenderKeyBundle = {
  identityKey: CryptoKeyPair;
};

export type ReceiverPreKeyBundle = {
  identityKey: KeyPair;
  pqIdentityPublicKey: Uint8Array;
  signedPreKey: KeyPair;
  pqSignedPreKeyPublicKey: Uint8Array;
  oneTimePreKey?: KeyPair | null;
  pqOneTimePreKeyPublicKey?: Uint8Array | null;
};


export type KeyBundle = {
  identityKeyX25519: KeyPair;
  pqIdentityKey: KeyPair;
  signedPreKey: { keyPair: KeyPair };
  pqSignedPreKey: KeyPair;
  oneTimePreKey?: KeyPair | null;
  pqOneTimePreKey?: KeyPair | null;
};
