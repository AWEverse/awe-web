import { State } from "../types";
import { MAX_SKIP } from "../config";
import { bufferToHex } from "./utils";
import Crypto from "../crypto/ratcherCrypto"

/**
 * Try to decrypt a message with skipped message keys.
 * This handles out-of-order message delivery.
 */
export function trySkippedMessageKeys(
  state: State,
  header: Uint8Array,
  ciphertext: Uint8Array,
  AD: Uint8Array,
): string | null {
  if (!header || header.length < 40) {
    throw new Error("Invalid header");
  }

  const headerPublicKey = header.subarray(0, 32);
  const messageNumber = new DataView(
    header.buffer,
    header.byteOffset + 36,
    4,
  ).getUint32(0, false);

  // Create a key for the skipped message map
  const key = `msg_key:${bufferToHex(headerPublicKey)}.msg_index:${messageNumber}`;
  const mk = state.MKSKIPPED.get(key);

  if (mk) {
    try {
      // Delete the key before attempting decryption to prevent replay attacks
      state.MKSKIPPED.delete(key);

      const associatedData = Crypto.concat(AD, header);
      const plaintext = Crypto.decrypt(mk.key, ciphertext, associatedData);

      // Wipe the message key after successful decryption
      Crypto.wipeMemory(mk.key);

      return plaintext;
    } catch (error) {
      // If decryption fails, restore the key
      state.MKSKIPPED.set(key, mk);
      throw error;
    }
  }

  return null;
}

/**
 * Skip message keys in the current receiving chain to handle out-of-order messages.
 * Implements memory-bounded storage to prevent DoS attacks.
 */
export function skipMessageKeys(state: State, until: number): void {
  if (state.Nr + MAX_SKIP < until) {
    throw new Error(`Too many skipped messages (${until - state.Nr}). Maximum allowed: ${MAX_SKIP}`);
  }

  if (!state.CKr || !state.DHr) {
    return; // No receiving chain established yet
  }

  const dhHex = bufferToHex(state.DHr);

  // Calculate number of keys to skip
  const keysToSkip = until - state.Nr;

  // If we need to skip more than a threshold, consider using a more efficient approach
  if (keysToSkip > 100) {
    let ck = state.CKr;
    // Skip keys in batches using chain key evolution
    for (let i = 0; i < keysToSkip; i++) {
      const [newCK, mk] = Crypto.kdfCK(ck);
      ck = newCK;

      // Only store keys that might be needed
      if (state.MKSKIPPED.size < MAX_SKIP) {
        state.MKSKIPPED.set(`${dhHex}:${state.Nr + i}`, { key: mk, timestamp: Date.now() });
      } else {
        // If we hit the limit, wipe extra keys immediately
        Crypto.wipeMemory(mk);
      }
    }
    state.CKr = ck;
  } else {
    // For smaller skips, use the regular approach
    while (state.Nr < until) {
      const [newCKr, mk] = Crypto.kdfCK(state.CKr);
      state.CKr = newCKr;

      if (state.MKSKIPPED.size >= MAX_SKIP) {
        // Find and remove oldest key if we hit the limit
        let oldestKey = null;
        let oldestNumber = Infinity;

        for (const [key] of state.MKSKIPPED) {
          const msgNumber = parseInt(key.split(':')[1]);
          if (msgNumber < oldestNumber) {
            oldestNumber = msgNumber;
            oldestKey = key;
          }
        }

        if (oldestKey) {
          const oldMk = state.MKSKIPPED.get(oldestKey);
          if (oldMk) {
            Crypto.wipeMemory(oldMk.key);
          }
          state.MKSKIPPED.delete(oldestKey);
        }
      }

      state.MKSKIPPED.set(`${dhHex}:${state.Nr}`, { key: mk, timestamp: Date.now() });
      state.Nr++;
    }
  }
}
