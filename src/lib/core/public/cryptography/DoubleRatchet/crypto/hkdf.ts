import sodium from "libsodium-wrappers";

const HASH_LEN = 32;

/**
 * Optimized HKDF (RFC 5869) combining extract and expand phases
 * @param salt - Non-secret random value
 * @param ikm - Input key material
 * @param info - Context/application-specific info
 * @param length - Desired output key length
 * @returns Output keying material
 */
export default function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
): Uint8Array {
  if (length > 255 * HASH_LEN) throw new Error("HKDF: output too long");

  // Extract: Derive pseudorandom key (PRK)
  const prk: Uint8Array = sodium.crypto_generichash(HASH_LEN, ikm, salt);

  // Expand: Generate output keying material (OKM)
  const okm: Uint8Array = new Uint8Array(length);
  let offset = 0;
  let T: Uint8Array = new Uint8Array(0); // Previous hash output

  for (let i = 1; offset < length; i++) {
    // Prepare input: T || info || counter
    const input: Uint8Array = new Uint8Array(T.length + info.length + 1);
    input.set(T, 0);
    input.set(info, T.length);
    input[T.length + info.length] = i;

    T = sodium.crypto_generichash(HASH_LEN, input, prk);

    const toCopy = Math.min(HASH_LEN, length - offset);
    okm.set(T.subarray(0, toCopy), offset);
    offset += toCopy;
  }

  // Zeroize sensitive data
  sodium.memzero(prk);
  sodium.memzero(T);

  return okm;
}
