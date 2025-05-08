/**
 * Double Ratchet Protocol Implementation
 * Based on Signal Protocol specification: https://signal.org/docs/specifications/doubleratchet/
 *
 * The Double Ratchet algorithm provides end-to-end encryption with:
 * - Forward secrecy: Compromise of keys doesn't affect past messages
 * - Break-in recovery: Security is restored after key compromise
 * - Out-of-order message handling: Messages can arrive in any order
 */

/**
 * Represents a Diffie-Hellman key pair used for key agreement
 */
export interface DHKeyPair {
  publicKey: Uint8Array;   // Public key for DH key agreement (32 bytes)
  privateKey: Uint8Array;  // Private key for DH key agreement (32 bytes)
}

/**
 * Represents the state of a Double Ratchet session
 */
export interface State {
  /** Current own DH key pair (sender) */
  DHs: DHKeyPair;

  /** Latest received DH public key from conversation partner */
  DHr: Uint8Array | null;

  /** Root Key - Provides forward secrecy across DH ratchet steps */
  RK: Uint8Array;

  /** Header encryption key - Protects metadata in message headers */
  HK: Uint8Array;

  /** Sending Chain Key - Provides forward secrecy within sending chain */
  CKs: Uint8Array | null;

  /** Receiving Chain Key - Provides forward secrecy within receiving chain */
  CKr: Uint8Array | null;

  /** Number of messages sent in current sending chain */
  Ns: number;

  /** Number of messages received in current receiving chain */
  Nr: number;

  /** Number of messages in previous sending chain */
  PN: number;

  /** Storage for skipped-over message keys with timestamps */
  MKSKIPPED: Map<string, {
    /** The message key */
    key: Uint8Array;
    /** Timestamp when the key was stored */
    timestamp: number;
  }>;

  /** Timestamp of last sent message */
  lastSentTimestamp: number;

  /** Timestamp of last received message */
  lastReceivedTimestamp: number;
}

/**
 * Represents an encrypted message in the Double Ratchet protocol
 */
export interface Message {
  /** Encrypted message header containing DH public key and chain indices */
  header: Uint8Array;

  /** Encrypted message content with authentication tag */
  ciphertext: Uint8Array;
}
