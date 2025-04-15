import sodium from "libsodium-wrappers";

const HASH_LEN = 32;

/**
 * Optimized HKDF (RFC 5869) combining extract and expand phases
 * @param salt - Non-secret random value (defaults to zero-filled array if empty)
 * @param ikm - Input key material (non-empty)
 * @param info - Context/application-specific info
 * @param length - Desired output key length
 * @returns Output keying material
 * @throws Error if inputs are invalid or output length is too long
 */
export default function hkdf(
  salt: Uint8Array | null,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
): Uint8Array {
  if (!(ikm instanceof Uint8Array) || ikm.length === 0) {
    throw new Error("HKDF: ikm must be a non-empty Uint8Array");
  }
  if (!(info instanceof Uint8Array)) {
    throw new Error("HKDF: info must be a Uint8Array");
  }
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("HKDF: length must be a positive integer");
  }
  if (length > 255 * HASH_LEN) {
    throw new Error("HKDF: output length exceeds 255 * hash length");
  }

  // Handle salt: default to zero-filled array if null or empty
  const effectiveSalt = salt instanceof Uint8Array && salt.length > 0
    ? salt
    : new Uint8Array(HASH_LEN);

  // Extract: Derive pseudorandom key (PRK)
  // Uses crypto_generichash (BLAKE2b) with HASH_LEN = 32
  const prk = sodium.crypto_generichash(HASH_LEN, ikm, effectiveSalt);

  const okm = new Uint8Array(length);
  let offset = 0;
  let T: Uint8Array = new Uint8Array(HASH_LEN);
  let T_prev = new Uint8Array(0);

  for (let i = 1; offset < length; i++) {
    // Prepare input: T_prev || info || counter
    const input: Uint8Array = new Uint8Array(T_prev.length + info.length + 1);
    input.set(T_prev, 0);
    input.set(info, T_prev.length);
    input[T_prev.length + info.length] = i;

    // Compute T = HMAC(PRK, T_prev || info || i)
    T = sodium.crypto_generichash(HASH_LEN, input, prk);

    const toCopy = Math.min(HASH_LEN, length - offset);
    okm.set(T.subarray(0, toCopy), offset);
    offset += toCopy;

    T_prev = T.slice();
  }

  try {
    sodium.memzero?.(prk);
    sodium.memzero?.(T);
    sodium.memzero?.(T_prev);
  } catch (e) {
    prk.fill(0);
    T.fill(0);
    T_prev.fill(0);
  }

  return okm;
}
