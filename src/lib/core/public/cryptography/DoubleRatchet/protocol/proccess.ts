import { State, Message } from "../types";
import { trySkippedMessageKeys, skipMessageKeys } from "./skipped";
import { arraysEqual } from "./utils";
import Crypto from "../crypto/ratcherCrypto";

/**
 * Perform a DH ratchet step
 */
export function dhRatchet(state: State, header: Uint8Array): void {
  state.PN = state.Ns;
  state.Ns = 0;
  state.Nr = 0;

  state.DHr = new Uint8Array(header.subarray(0, 32));
  const dhOutput1 = Crypto.dh(state.DHs, state.DHr);
  [state.RK, state.CKr] = Crypto.kdfRK(state.RK, dhOutput1);
  Crypto.wipeMemory(dhOutput1);

  const oldDHs = state.DHs;
  state.DHs = Crypto.generateDH();
  const dhOutput2 = Crypto.dh(state.DHs, state.DHr);
  [state.RK, state.CKs] = Crypto.kdfRK(state.RK, dhOutput2);
  Crypto.wipeMemory(dhOutput2);

  Crypto.wipeMemory(oldDHs.privateKey);
}

/**
 * Encrypt a message using the Double Ratchet algorithm
 */
export function ratchetEncrypt(
  state: State,
  plaintext: string,
  AD: Uint8Array,
): Message {
  if (!state.CKs) throw new Error("Send chain key not initialized");

  const [newCKs, mk] = Crypto.kdfCK(state.CKs);
  state.CKs = newCKs;

  const header = Crypto.header(state.DHs, state.PN, state.Ns);
  state.Ns++;

  const associatedData = Crypto.concat(AD, header);
  const ciphertext = Crypto.encrypt(mk, plaintext, associatedData);

  Crypto.wipeMemory(mk);
  return { header, ciphertext };
}

/**
 * Decrypt a message using the Double Ratchet algorithm
 */
export function ratchetDecrypt(
  state: State,
  header: Uint8Array,
  ciphertext: Uint8Array,
  AD: Uint8Array,
): string {
  if (header.length !== 40) throw new Error("Invalid header");

  const skippedPlaintext = trySkippedMessageKeys(state, header, ciphertext, AD);
  if (skippedPlaintext !== null) return skippedPlaintext;

  const headerPublicKey = header.subarray(0, 32);
  const view = new DataView(header.buffer, header.byteOffset);
  const headerPN = view.getUint32(32, false);
  const headerN = view.getUint32(36, false);

  if (!state.DHr || !arraysEqual(headerPublicKey, state.DHr)) {
    skipMessageKeys(state, headerPN);
    dhRatchet(state, header);
  }

  skipMessageKeys(state, headerN);

  if (!state.CKr) throw new Error("Receive chain key not initialized");

  const [newCKr, mk] = Crypto.kdfCK(state.CKr);
  state.CKr = newCKr;
  state.Nr++;

  const associatedData = Crypto.concat(AD, header);
  const plaintext = Crypto.decrypt(mk, ciphertext, associatedData);

  Crypto.wipeMemory(mk);
  return plaintext;
}
