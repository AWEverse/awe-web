import { State, DHKeyPair } from "../types";
import Crypto from "../crypto/ratcherCrypto"

/**
* Initialize a Double Ratchet session for Sender (the initiator)
*/
export function ratchetInitSender(
  state: State,
  SK: Uint8Array,
  bobPublicKey: Uint8Array,
): void {
  if (!SK || SK.length !== 32) {
    throw new Error("Invalid shared key");
  }

  if (!bobPublicKey || bobPublicKey.length !== 32) {
    throw new Error("Invalid public key");
  }

  state.DHs = Crypto.generateDH();
  state.DHr = new Uint8Array(bobPublicKey);

  // DH output becomes input to KDF_RK
  const dhOut = Crypto.dh(state.DHs, state.DHr);
  [state.RK, state.CKs] = Crypto.kdfRK(SK, dhOut);

  // Wipe the DH output as we don't need it anymore
  Crypto.wipeMemory(dhOut);

  state.CKr = null;
  state.Ns = 0;
  state.Nr = 0;
  state.PN = 0;
  state.MKSKIPPED = new Map();
}

/**
 * Initialize a Double Ratchet session for Receiver (the responder)
 */
export function ratchetInitReceiver(
  state: State,
  SK: Uint8Array,
  bobKeyPair: DHKeyPair,
): void {
  if (!SK || SK.length !== 32) {
    throw new Error("Invalid shared key");
  }

  if (!bobKeyPair || !bobKeyPair.privateKey || !bobKeyPair.publicKey) {
    throw new Error("Invalid key pair");
  }

  state.DHs = {
    publicKey: new Uint8Array(bobKeyPair.publicKey),
    privateKey: new Uint8Array(bobKeyPair.privateKey),
  };

  state.DHr = null;
  state.RK = new Uint8Array(SK);
  state.CKs = null;
  state.CKr = null;
  state.Ns = 0;
  state.Nr = 0;
  state.PN = 0;
  state.MKSKIPPED = new Map();
}
