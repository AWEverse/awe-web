import { State, Message } from "../types";
import { trySkippedMessageKeys, skipMessageKeys } from "./skipped";
import { arraysEqual } from "./utils";
import Crypto from "../crypto/ratcherCrypto";
import { MAX_CHAIN_LEN } from "../config";

/**
 * Perform a DH ratchet step when receiving a message from a new sending chain
 */
export function dhRatchet(state: State, header: Uint8Array): void {
  // Store current chain length and reset message counters
  state.PN = state.Ns;
  state.Ns = 0;
  state.Nr = 0;

  // Update receiving chain with sender's new ratchet public key
  state.DHr = new Uint8Array(header.subarray(0, 32));

  try {
    // First DH ratchet step
    const dhOutput1 = Crypto.dh(state.DHs, state.DHr);
    [state.RK, state.CKr] = Crypto.kdfRK(state.RK, dhOutput1);

    // Update header key
    state.HK = Crypto.deriveHeaderKey(state.RK);

    Crypto.wipeMemory(dhOutput1);

    // Generate new ratchet key pair
    const oldDHs = state.DHs;
    state.DHs = Crypto.generateDH();

    // Second DH ratchet step
    const dhOutput2 = Crypto.dh(state.DHs, state.DHr);
    [state.RK, state.CKs] = Crypto.kdfRK(state.RK, dhOutput2);
    Crypto.wipeMemory(dhOutput2);

    // Clean up old keys
    Crypto.wipeMemory(oldDHs.privateKey);
  } catch (error) {
    state.DHr = null;
    throw error;
  }
}

/**
 * Encrypt a message using the Double Ratchet algorithm
 */
export function ratchetEncrypt(
  state: State,
  plaintext: string,
  AD: Uint8Array,
): Message {
  if (!state.CKs) {
    throw new Error("Send chain not initialized");
  }

  // Check if we need to start a new chain
  if (state.Ns >= MAX_CHAIN_LEN) {
    const oldDHs = state.DHs;
    state.DHs = Crypto.generateDH();

    if (state.DHr) {
      const dhOut = Crypto.dh(state.DHs, state.DHr);
      [state.RK, state.CKs] = Crypto.kdfRK(state.RK, dhOut);
      state.HK = Crypto.deriveHeaderKey(state.RK);
      Crypto.wipeMemory(dhOut);
    }
    Crypto.wipeMemory(oldDHs.privateKey);
    state.PN = state.Ns;
    state.Ns = 0;
  }

  try {
    // Advance the sending chain
    const [newCKs, mk] = Crypto.kdfCK(state.CKs);
    state.CKs = newCKs;

    // Create and encrypt header
    const header = Crypto.header(state.DHs, state.PN, state.Ns);
    const encryptedHeader = Crypto.encryptHeader(state.HK, header);

    state.Ns++;
    state.lastSentTimestamp = Date.now();

    // Encrypt message
    const associatedData = Crypto.concat(AD, header);
    const ciphertext = Crypto.encrypt(mk, plaintext, associatedData);

    Crypto.wipeMemory(mk);
    return { header: encryptedHeader, ciphertext };
  } catch (error) {
    state.Ns--;
    throw error;
  }
}

/**
 * Decrypt a message using the Double Ratchet algorithm
 */
export function ratchetDecrypt(
  state: State,
  encryptedHeader: Uint8Array,
  ciphertext: Uint8Array,
  AD: Uint8Array,
): string {
  // Decrypt the header first
  const header = Crypto.decryptHeader(state.HK, encryptedHeader);

  if (header.length !== 40) {
    throw new Error("Invalid header size");
  }

  // Try to decrypt with a previously skipped message key
  const skippedPlaintext = trySkippedMessageKeys(state, header, ciphertext, AD);
  if (skippedPlaintext !== null) {
    return skippedPlaintext;
  }

  // Parse header
  const headerPublicKey = header.subarray(0, 32);
  const view = new DataView(header.buffer, header.byteOffset);
  const headerPN = view.getUint32(32, false);
  const headerN = view.getUint32(36, false);

  try {
    // Perform DH ratchet step if we have a new ratchet public key
    if (!state.DHr || !arraysEqual(headerPublicKey, state.DHr)) {
      skipMessageKeys(state, headerPN);
      dhRatchet(state, header);
    }

    // Skip message keys if needed
    skipMessageKeys(state, headerN);

    if (!state.CKr) {
      throw new Error("Receive chain key not initialized");
    }

    // Advance the receiving chain
    const [newCKr, mk] = Crypto.kdfCK(state.CKr);
    state.CKr = newCKr;
    state.Nr++;
    state.lastReceivedTimestamp = Date.now();

    // Decrypt message
    const associatedData = Crypto.concat(AD, header);
    const plaintext = Crypto.decrypt(mk, ciphertext, associatedData);

    Crypto.wipeMemory(mk);
    return plaintext;
  } catch (error) {
    if (state.Nr > 0) state.Nr--;
    throw error;
  }
}
