export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface SharedSecretAndCiphertext {
  sharedSecret: Uint8Array;
  ciphertext: Uint8Array;
}

export interface SignedPrekey {
  keyPair: KeyPair;
  signature: Uint8Array;
}

export interface KeyBundle {
  identityKey: KeyPair;
  signedPrekey: SignedPrekey;
  oneTimePrekeys: Uint8Array[];
}

export interface PublicKeyBundle {
  identityKeyEd25519: Uint8Array; // Ed25519 public key for signature verification
  identityKeyX25519: Uint8Array; // X25519 public key for DH
  signedPrekey: {
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
  oneTimePrekeys: Uint8Array[];
}

export interface InitialMessage {
  identityKey: Uint8Array;
  ephemeralKey: Uint8Array;
  usedPrekeys: {
    signedPrekey: boolean;
    oneTimePrekeyIndex?: number;
  };
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}
