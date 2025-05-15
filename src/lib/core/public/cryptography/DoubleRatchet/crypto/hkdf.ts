import sodium from "libsodium-wrappers";

const HASH_LEN = 32;
const MAX_OUTPUT_LENGTH = 255 * HASH_LEN;

/**
 * Optimized HKDF (RFC 5869) implementation with performance and security improvements
 * @param salt - Optional non-secret random value (defaults to zero-filled array)
 * @param ikm - Input key material (must be non-empty Uint8Array)
 * @param info - Context/application-specific info
 * @param length - Desired output key length (must be ≤ 255*HASH_LEN)
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
  if (!Number.isInteger(length) || length <= 0 || length > MAX_OUTPUT_LENGTH) {
    throw new Error(
      `HKDF: length must be a positive integer ≤ ${MAX_OUTPUT_LENGTH}`,
    );
  }

  const okm = new Uint8Array(length);

  const prk = sodium.crypto_generichash(
    HASH_LEN,
    ikm,
    salt instanceof Uint8Array && salt.length > 0
      ? salt
      : new Uint8Array(HASH_LEN),
  );

  const hashInput = new Uint8Array(HASH_LEN + info.length + 1);
  hashInput.set(info, HASH_LEN);

  let prevBlock = new Uint8Array(0);
  let remaining = length;
  let offset = 0;

  for (let i = 1; remaining > 0; i++) {
    hashInput.set(prevBlock, 0);
    hashInput[HASH_LEN + info.length] = i;

    const block = sodium.crypto_generichash(
      HASH_LEN,
      hashInput.subarray(0, prevBlock.length + info.length + 1),
      prk,
    ) as Uint8Array<ArrayBuffer>;

    const copyLength = Math.min(HASH_LEN, remaining);
    okm.set(block.subarray(0, copyLength), offset);
    offset += copyLength;
    remaining -= copyLength;

    prevBlock = block;
  }

  try {
    sodium.memzero?.(prk);
    sodium.memzero?.(hashInput);
    sodium.memzero?.(prevBlock);
  } catch (e) { }

  return okm;
}
