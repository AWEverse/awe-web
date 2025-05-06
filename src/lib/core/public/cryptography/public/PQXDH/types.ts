/**
 * TypeScript types for the PQXDH (Post-Quantum Extended Diffie-Hellman) protocol.
 * Based on: https://signal.org/docs/specifications/pqxdh/
 */

/** Supported elliptic curves for Diffie-Hellman operations. */
export type Curve = "curve25519" | "ed25519" | "curve448";

/** Supported hash functions for the protocol. */
export type Hash = "SHA-256" | "SHA-512";

/** Supported post-quantum KEM mechanisms. */
export type PQKEM = "CRYSTALS-KYBER-512" | "CRYSTALS-KYBER-768" | "CRYSTALS-KYBER-1024";

/** Supported AEAD encryption schemes. */
export type AEAD = "AES-256-GCM" | "ChaCha20-Poly1305" | string;

/** Application identifier, minimum 8 bytes. */
export type Info = string;

/** Encodes an elliptic curve public key to bytes. */
export type EncodeEC = (publicKey: PublicKey) => Uint8Array;

/** Decodes bytes to an elliptic curve public key. */
export type DecodeEC = (bytes: Uint8Array) => PublicKey;

/** Encodes a post-quantum KEM public key to bytes. */
export type EncodeKEM = (publicKey: PQKEMPublicKey) => Uint8Array;

/** Decodes bytes to a post-quantum KEM public key. */
export type DecodeKEM = (bytes: Uint8Array) => PQKEMPublicKey;

/** Public key for elliptic curve operations. */
export interface PublicKey {
  curve: Curve;
  data: Uint8Array;
}

/** Private key for elliptic curve operations. */
export interface PrivateKey {
  curve: Curve;
  data: Uint8Array;
}

/** Public key for post-quantum KEM. */
export interface PQKEMPublicKey {
  kem: PQKEM;
  data: Uint8Array;
}

/** Private key for post-quantum KEM. */
export interface PQKEMPrivateKey {
  kem: PQKEM;
  data: Uint8Array;
}

/** Elliptic curve key pair. */
export interface ECKeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

/** Post-quantum KEM key pair. */
export interface PQKEMKeyPair {
  publicKey: PQKEMPublicKey;
  privateKey: PQKEMPrivateKey;
}

/** Unique identifier for keys. */
export type KeyIdentifier = string;

/** Sender's keys for PQXDH protocol. */
export interface SenderKeys {
  IK_s: ECKeyPair; // Sender's identity key
  IK_s_dh: ECKeyPair; // Sender's identity key for DH
  EK_s: ECKeyPair; // Sender's ephemeral key
}

/** Receiver's keys for PQXDH protocol. */
export interface ReceiverKeys {
  IK_r: ECKeyPair; // Receiver's identity key
  IK_r_dh: ECKeyPair; // Receiver's identity key for DH
  SPK_r: ECKeyPair & { id: KeyIdentifier }; // Signed prekey
  OPK_r?: ECKeyPair & { id: KeyIdentifier }; // Optional one-time prekey
  PQSPK_r: PQKEMKeyPair & { id: KeyIdentifier }; // Signed last-resort KEM prekey
  PQOPK_r?: PQKEMKeyPair & { id: KeyIdentifier }; // Optional one-time KEM prekey
}

/** Diffie-Hellman function for elliptic curves. */
export type DHFunction = (publicKey: PublicKey, privateKey: PrivateKey) => Uint8Array;

/** XEdDSA signature function. */
export type SignatureFunction = (privateKey: PrivateKey, message: Uint8Array, randomness: Uint8Array) => Uint8Array;

/** XEdDSA signature verification function. */
export type VerifyFunction = (publicKey: PublicKey, message: Uint8Array, signature: Uint8Array) => boolean;

/** HKDF key derivation function. */
export type KDFFunction = (salt: Uint8Array, inputKeyMaterial: Uint8Array, info: Uint8Array, outputLength: number) => Uint8Array;

/** Post-quantum KEM encapsulation function. */
export type PQKEMEncFunction = (pk: PQKEMPublicKey) => { ciphertext: Uint8Array; sharedSecret: Uint8Array };

/** Post-quantum KEM decapsulation function. */
export type PQKEMDecFunction = (sk: PQKEMPrivateKey, ciphertext: Uint8Array) => Uint8Array;

/** AEAD encryption function. */
export type AEADEncFunction = (key: Uint8Array, plaintext: Uint8Array, associatedData: Uint8Array) => Uint8Array;

/** AEAD decryption function. */
export type AEADDecFunction = (key: Uint8Array, ciphertext: Uint8Array, associatedData: Uint8Array) => Uint8Array;

/** Prekey bundle fetched by sender from server. */
export interface PrekeyBundle {
  IK_r: PublicKey; // Receiver's identity key
  SPK_r: PublicKey; // Signed prekey
  SPK_r_Id: KeyIdentifier; // Signed prekey identifier
  SPK_r_Sig: Uint8Array; // Signature on signed prekey
  PQPK_r: PQKEMPublicKey; // KEM prekey (one-time or last-resort)
  PQPK_r_Id: KeyIdentifier; // KEM prekey identifier
  PQPK_r_Sig: Uint8Array; // Signature on KEM prekey
  OPK_r?: PublicKey; // Optional one-time prekey
  OPK_r_Id?: KeyIdentifier; // Optional one-time prekey identifier
  random: Uint8Array; // Random value
}

/** Initial message sent from sender to receiver. */
export interface InitialMessage {
  IK_s: PublicKey; // Sender's identity key
  EK_s: PublicKey; // Sender's ephemeral key
  CT: Uint8Array; // KEM ciphertext
  identifiers: {
    SPK_r_Id: KeyIdentifier; // Signed prekey identifier
    PQPK_r_Id: KeyIdentifier; // KEM prekey identifier
    OPK_r_Id?: KeyIdentifier; // Optional one-time prekey identifier
  };
  ciphertext: Uint8Array; // AEAD-encrypted initial ciphertext
}

/** Associated data for AEAD encryption. */
export type AssociatedData = Uint8Array;

/** Cryptographic parameters for PQXDH protocol. */
export interface PQXDHParameters {
  curve: Curve;
  hash: Hash;
  info: Info;
  pqkem: PQKEM;
  aead: AEAD;
  convertPublicKeyToCurve25519?: (ed25519PublicKey: Uint8Array) => Uint8Array;
  convertPrivateKeyToCurve25519?: (ed25519PrivateKey: Uint8Array) => Uint8Array;
  encodeEC: EncodeEC;
  decodeEC: DecodeEC;
  encodeKEM: EncodeKEM;
  decodeKEM: DecodeKEM;
}

/** Client-side context for PQXDH protocol. */
export interface PQXDHContext {
  parameters: PQXDHParameters;
  sender: SenderKeys;
  receiver: ReceiverKeys;
  dh: DHFunction;
  sig: SignatureFunction;
  verify: VerifyFunction;
  kdf: KDFFunction;
  pqkemEnc: PQKEMEncFunction;
  pqkemDec: PQKEMDecFunction;
  aeadEnc: AEADEncFunction;
  aeadDec: AEADDecFunction;
}

/** Result of PQXDH protocol execution. */
export interface PQXDHResult {
  masterKey: Uint8Array; // Derived master key
  associatedData: AssociatedData; // Associated data for Double Ratchet
  initialMessage?: InitialMessage; // Initial message sent by sender
}
