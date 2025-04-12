import sodium from 'libsodium-wrappers';

/**
 * Securely erases a Uint8Array by overwriting it with zeros, designed to resist JIT optimizations.

 * @param buffer The Uint8Array to erase.
 */
export function secureErase(buffer: Uint8Array): void {

  sodium.memzero(buffer);
}

export function wipeBytes(...arrays: Uint8Array[]): void {
  const len = arrays.length;

  for (let i = 0; i < len; ++i) {
    sodium.memzero(arrays[i]);
  }
}
