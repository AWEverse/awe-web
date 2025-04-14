import { State } from "../types";
import { MAX_SKIP } from "../config";
import { bufferToHex } from "./utils";
import Crypto from "../crypto/ratcherCrypto"

/**
 * Try to decrypt a message with skipped message keys
 */
export function trySkippedMessageKeys(
  state: State,
  header: Uint8Array,
  ciphertext: Uint8Array,
  AD: Uint8Array,
): string | null {
  const headerPublicKey = header.subarray(0, 32);
  const messageNumber = new DataView(
    header.buffer,
    header.byteOffset + 36,
    4,
  ).getUint32(0, false);

  // Create a key for the skipped message map
  const key = `${bufferToHex(headerPublicKey)}:${messageNumber}`;
  const mk = state.MKSKIPPED.get(key);

  if (mk) {
    state.MKSKIPPED.delete(key);

    const associatedData = Crypto.concat(AD, header);
    const plaintext = Crypto.decrypt(mk, ciphertext, associatedData);

    // Wipe the message key
    Crypto.wipeMemory(mk);

    return plaintext;
  }

  return null;
}

/**
 * Skip message keys in the current receiving chain
 */
export function skipMessageKeys(state: State, until: number): void {
  if (state.Nr + MAX_SKIP < until) {
    throw new Error(`Too many skipped messages: ${until - state.Nr}`);
  }

  if (!state.CKr || !state.DHr) return;

  const dhHex = bufferToHex(state.DHr);

  while (state.Nr < until) {
    const [newCKr, mk] = Crypto.kdfCK(state.CKr);
    state.CKr = newCKr;

    if (state.MKSKIPPED.size >= MAX_SKIP) {
      state.MKSKIPPED.clear(); // Очищення для запобігання DoS
    }
    state.MKSKIPPED.set(`${dhHex}:${state.Nr}`, mk);
    state.Nr++;
  }
}
