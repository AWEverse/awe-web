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
  identityKey: Uint8Array;
  signedPrekey: {
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
  oneTimePrekeys: Uint8Array[];
}
