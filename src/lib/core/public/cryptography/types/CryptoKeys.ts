/**
 * TypeScript definitions for the PQXDH Key Agreement Protocol client-side implementation.
 * Based on the PQXDH specification: https://signal.org/docs/specifications/pqxdh/
 */

/**
 * Represents the elliptic curve used for Diffie-Hellman operations.
 * Supports Curve25519 and Curve448 as specified in RFC 7748.
 */
type Curve = "curve25519" | "curve448";

/**
 * Specifies the hash function used in the protocol.
 * Supports SHA-256 or SHA-512 as 256-bit or 512-bit hash functions.
 */
type Hash = "SHA-256" | "SHA-512";

/**
 * Defines the post-quantum key encapsulation mechanism (KEM).
 * Currently supports CRYSTALS-KYBER-{512 | 768 | 1024} for IND-CCA post-quantum security.
 */
type PQKEM = "CRYSTALS-KYBER-1024";

/**
 * Represents the authenticated encryption with associated data (AEAD) scheme.
 * Must provide IND-CPA and INT-CTXT post-quantum security.
 */
type AEAD = string;

/**
 * ASCII string identifying the application.
 * Must be at least 8 bytes long.
 */
type Info = string;

/**
 * Encodes an elliptic curve public key into a byte sequence.
 * Typically includes a single-byte curve identifier followed by little-endian u-coordinate encoding.
 */
type EncodeEC = (publicKey: PublicKey) => Uint8Array;

/**
 * Decodes a byte sequence into an elliptic curve public key.
 * Inverse of EncodeEC, validates curve identifier and decodes u-coordinate.
 */
type DecodeEC = (bytes: Uint8Array) => PublicKey;

/**
 * Encodes a post-quantum KEM public key into a byte sequence.
 * Includes a single-byte KEM identifier followed by the KEM-specific encoding.
 */
type EncodeKEM = (publicKey: PQKEMPublicKey) => Uint8Array;

/**
 * Decodes a byte sequence into a post-quantum KEM public key.
 * Inverse of EncodeKEM, validates KEM identifier and applies KEM-specific decoding.
 */
type DecodeKEM = (bytes: Uint8Array) => PQKEMPublicKey;

/**
 * Represents an elliptic curve public key.
 */
interface PublicKey {
  /** The curve used for this key (curve25519 or curve448). */
  curve: Curve;
  /** The raw key data as a byte sequence. */
  data: Uint8Array;
}

/**
 * Represents an elliptic curve private key.
 */
interface PrivateKey {
  /** The curve used for this key (curve25519 or curve448). */
  curve: Curve;
  /** The raw key data as a byte sequence. */
  data: Uint8Array;
}

/**
 * Represents a post-quantum KEM public key.
 */
interface PQKEMPublicKey {
  /** The KEM used for this key (e.g., CRYSTALS-KYBER-1024). */
  kem: PQKEM;
  /** The raw key data as a byte sequence. */
  data: Uint8Array;
}

/**
 * Represents a post-quantum KEM private key.
 */
interface PQKEMPrivateKey {
  /** The KEM used for this key (e.g., CRYSTALS-KYBER-1024). */
  kem: PQKEM;
  /** The raw key data as a byte sequence. */
  data: Uint8Array;
}

/**
 * Represents an elliptic curve key pair (public and private keys).
 */
interface ECKeyPair {
  /** The public key of the pair. */
  publicKey: PublicKey;
  /** The private key of the pair. */
  privateKey: PrivateKey;
}

/**
 * Represents a post-quantum KEM key pair (public and private keys).
 */
interface PQKEMKeyPair {
  /** The public key of the pair. */
  publicKey: PQKEMPublicKey;
  /** The private key of the pair. */
  privateKey: PQKEMPrivateKey;
}

/**
 * Unique identifier for a key, used to reference prekeys on the server.
 * Can be a hash, random value, or sequential identifier to avoid collisions.
 */
type KeyIdentifier = string;

/**
 * Defines the keys used by Sender in the PQXDH protocol.
 */
interface SenderKeys {
  /** Sender's long-term identity key pair. */
  IK_s: ECKeyPair;
  /** Sender's ephemeral key pair, generated for each protocol run. */
  EK_s: ECKeyPair;
}

/**
 * Defines the keys used by Receiver in the PQXDH protocol.
 */
interface ReceiverKeys {
  /** Receiver's long-term identity key pair. */
  IK_r: ECKeyPair;
  /** Receiver's signed prekey pair with its identifier, periodically replaced. */
  SPK_r: ECKeyPair & { id: KeyIdentifier };
  /** Receiver's optional one-time prekey pair with its identifier, used once per protocol run. */
  OPK_r?: ECKeyPair & { id: KeyIdentifier };
  /** Receiver's signed last-resort post-quantum KEM prekey pair, used when one-time KEM prekeys are unavailable. */
  PQSPK_r: PQKEMKeyPair & { id: KeyIdentifier };
  /** Receiver's optional one-time post-quantum KEM prekey pair, used once per protocol run. */
  PQOPK_r?: PQKEMKeyPair & { id: KeyIdentifier };
}

/**
 * Performs an Elliptic Curve Diffie-Hellman operation (X25519 or X448).
 * Takes a public key and a private key, returns the shared secret as a byte sequence.
 */
type DHFunction = (pk1: PublicKey, pk2: PrivateKey) => Uint8Array;

/**
 * Generates an XEdDSA signature on a message using a public key and randomness.
 * Returns the signature as a 64-byte sequence, verifiable with the public key.
 */
type SignatureFunction = (
  pk: PublicKey,
  message: Uint8Array,
  randomness: Uint8Array,
) => Uint8Array;

/**
 * Derives a 32-byte key using HKDF with specified inputs.
 * Takes key material and produces a fixed-length output based on protocol parameters.
 */
type KDFFunction = (keyMaterial: Uint8Array) => Uint8Array;

/**
 * Performs post-quantum KEM encapsulation.
 * Takes a public KEM key, returns a ciphertext and the encapsulated shared secret.
 */
type PQKEMEncFunction = (pk: PQKEMPublicKey) => {
  ciphertext: Uint8Array;
  sharedSecret: Uint8Array;
};

/**
 * Performs post-quantum KEM decapsulation.
 * Takes a private KEM key and ciphertext, returns the decapsulated shared secret.
 */
type PQKEMDecFunction = (
  pk: PQKEMPrivateKey,
  ciphertext: Uint8Array,
) => Uint8Array;

/**
 * Represents a prekey bundle fetched by Sender from the server to initiate PQXDH.
 */
interface PrekeyBundle {
  /** Receiver's identity public key. */
  IK_r: PublicKey;
  /** Receiver's signed prekey public key. */
  SPK_r: PublicKey;
  /** Identifier for Receiver's signed prekey. */
  SPK_r_Id: KeyIdentifier;
  /** Signature on the signed prekey, signed with IKB. */
  SPK_r_Sig: Uint8Array;
  /** Receiver's post-quantum KEM prekey (either one-time or last-resort). */
  PQPK_r: PQKEMPublicKey;
  /** Identifier for Receiver's post-quantum KEM prekey. */
  PQPK_r_Id: KeyIdentifier;
  /** Signature on the post-quantum KEM prekey, signed with IKB. */
  PQPK_r_Sig: Uint8Array;
  /** Receiver's optional one-time prekey public key. */
  OPK_r_?: PublicKey;
  /** Identifier for Receiver's optional one-time prekey. */
  OPK_r_Id?: KeyIdentifier;
}

/**
 * Represents the initial message sent by Sender to Receiver.
 */
interface InitialMessage {
  /** Sender's identity public key. */
  IK_s: PublicKey;
  /** Sender's ephemeral public key. */
  EK_s: PublicKey;
  /** Post-quantum KEM ciphertext encapsulating the shared secret. */
  CT: Uint8Array;
  /** Identifiers for the prekeys used in the protocol run. */
  identifiers: {
    /** Identifier for Receiver's signed prekey. */
    SPK_r_Id: KeyIdentifier;
    /** Identifier for Receiver's post-quantum KEM prekey. */
    PQPK_r_Id: KeyIdentifier;
    /** Identifier for Receiver's optional one-time prekey. */
    OPK_r_Id?: KeyIdentifier;
  };
  /** AEAD-encrypted initial ciphertext, typically the first post-PQXDH message. */
  ciphertext: Uint8Array;
}

/**
 * Byte sequence containing identity information for both parties.
 * Used as associated data in AEAD encryption.
 */
type AssociatedData = Uint8Array;

/**
 * Defines the cryptographic parameters for the PQXDH protocol.
 */
interface PQXDHParameters {
  /** The elliptic curve used (curve25519 or curve448). */
  curve: Curve;
  /** The hash function used (SHA-256 or SHA-512). */
  hash: Hash;
  /** Application identifier (minimum 8 bytes). */
  info: Info;
  /** The post-quantum KEM used (e.g., CRYSTALS-KYBER-{512 | 768 | 1024}). */
  pqkem: PQKEM;
  /** The AEAD scheme used for encryption. */
  aead: AEAD;
  /** Function to encode elliptic curve public keys. */
  encodeEC: EncodeEC;
  /** Function to decode elliptic curve public keys. */
  decodeEC: DecodeEC;
  /** Function to encode post-quantum KEM public keys. */
  encodeKEM: EncodeKEM;
  /** Function to decode post-quantum KEM public keys. */
  decodeKEM: DecodeKEM;
}

/**
 * Represents the client-side context for the PQXDH protocol.
 */
interface PQXDHContext {
  /** Protocol parameters. */
  parameters: PQXDHParameters;
  /** Sender's keys. */
  sender: SenderKeys;
  /** Receiver's keys. */
  receiver: ReceiverKeys;
  /** Diffie-Hellman function for elliptic curve operations. */
  dh: DHFunction;
  /** Signature function for XEdDSA signatures. */
  sig: SignatureFunction;
  /** Key derivation function (HKDF). */
  kdf: KDFFunction;
  /** Post-quantum KEM encapsulation function. */
  pqkemEnc: PQKEMEncFunction;
  /** Post-quantum KEM decapsulation function. */
  pqkemDec: PQKEMDecFunction;
}
