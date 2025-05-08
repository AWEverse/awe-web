import { State, DHKeyPair } from "../types";
import Crypto from "../crypto/ratcherCrypto"
import { MAX_OLD_KEYS_AGE } from "../config";

/**
 * Initialize a Double Ratchet session for Sender (the initiator)
 *
 * @param state Empty state object to be initialized
 * @param SK 32-byte shared secret key established in X3DH
 * @param bobPublicKey Receiver's ratchet public key (from X3DH)
 * @throws Error if inputs are invalid
 */
export function ratchetInitSender(
  state: State,
  SK: Uint8Array,
  bobPublicKey: Uint8Array,
): void {
  // Input validation
  if (!SK || SK.length !== 32) {
    throw new Error("Invalid shared key - must be 32 bytes");
  }

  if (!bobPublicKey || bobPublicKey.length !== 32) {
    throw new Error("Invalid public key - must be 32 bytes");
  }

  // Generate sender's initial ratchet key pair
  state.DHs = Crypto.generateDH();

  // Store receiver's initial ratchet public key
  state.DHr = new Uint8Array(bobPublicKey);

  try {
    // Perform initial DH and key derivation
    const dhOut = Crypto.dh(state.DHs, state.DHr);
    [state.RK, state.CKs] = Crypto.kdfRK(SK, dhOut);

    // Generate header encryption key
    state.HK = Crypto.deriveHeaderKey(state.RK);

    Crypto.wipeMemory(dhOut);
  } catch (error) {
    // Clean up on failure
    Crypto.wipeMemory(state.DHs.privateKey);
    throw error;
  }

  // Initialize remaining state
  state.CKr = null;
  state.Ns = 0;
  state.Nr = 0;
  state.PN = 0;
  state.MKSKIPPED = new Map();
  state.lastSentTimestamp = Date.now();
  state.lastReceivedTimestamp = 0;
}

/**
 * Initialize a Double Ratchet session for Receiver (the responder)
 *
 * @param state Empty state object to be initialized
 * @param SK 32-byte shared secret key established in X3DH
 * @param bobKeyPair Receiver's initial ratchet key pair
 * @throws Error if inputs are invalid
 */
export function ratchetInitReceiver(
  state: State,
  SK: Uint8Array,
  bobKeyPair: DHKeyPair,
): void {
  // Input validation
  if (!SK || SK.length !== 32) {
    throw new Error("Invalid shared key - must be 32 bytes");
  }

  if (!bobKeyPair ||
    !bobKeyPair.privateKey ||
    !bobKeyPair.publicKey ||
    bobKeyPair.privateKey.length !== 32 ||
    bobKeyPair.publicKey.length !== 32) {
    throw new Error("Invalid key pair - must contain 32-byte public and private keys");
  }

  // Copy key pair to avoid external modification
  state.DHs = {
    publicKey: new Uint8Array(bobKeyPair.publicKey),
    privateKey: new Uint8Array(bobKeyPair.privateKey),
  };

  // Initialize state for receiving
  state.DHr = null;
  state.RK = new Uint8Array(SK);
  state.HK = Crypto.deriveHeaderKey(state.RK);
  state.CKs = null;
  state.CKr = null;
  state.Ns = 0;
  state.Nr = 0;
  state.PN = 0;
  state.MKSKIPPED = new Map();
  state.lastSentTimestamp = 0;
  state.lastReceivedTimestamp = Date.now();
}

/**
 * Cleanup expired skipped message keys to prevent memory exhaustion
 */
export function cleanupSkippedMessageKeys(state: State): void {
  const now = Date.now();
  for (const [key, value] of state.MKSKIPPED.entries()) {
    if (now - value.timestamp > MAX_OLD_KEYS_AGE) {
      Crypto.wipeMemory(value.key);
      state.MKSKIPPED.delete(key);
    }
  }
}
