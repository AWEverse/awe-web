import { State } from "../types";
import Crypto from "../crypto/ratcherCrypto"
import sodium from "libsodium-wrappers";

/**
 * Helper function to compare two Uint8Arrays
 */
export function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  // Use libsodium's constant-time comparison
  try {
    return sodium.memcmp(a, b);
  } catch (e) {
    if (a.length !== b.length) return false;
    let diff = 0;

    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }

    return diff === 0;
  }
}

/**
 * Convert a Uint8Array to hex string for use as map keys
 */
export function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Clean up a Double Ratchet state by securely wiping sensitive data
 */
export function cleanupState(state: State): void {
  if (state.DHs) {
    Crypto.wipeMemory(state.DHs.privateKey);
  }

  if (state.DHr) {
    Crypto.wipeMemory(state.DHr);
  }

  if (state.RK) {
    Crypto.wipeMemory(state.RK);
  }

  if (state.CKs) {
    Crypto.wipeMemory(state.CKs);
  }

  if (state.CKr) {
    Crypto.wipeMemory(state.CKr);
  }

  // Wipe all skipped message keys
  for (const mk of state.MKSKIPPED.values()) {
    Crypto.wipeMemory(mk);
  }

  state.MKSKIPPED.clear();
}
