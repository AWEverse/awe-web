import { useRef } from "react";
import sodium from "libsodium-wrappers";

export type UUIDTypes = string | Uint8Array;
export type Options = {
  random?: Uint8Array;
  rng?: () => Uint8Array;
};

function rng() {
  return sodium.randombytes_buf(16);
}

const byteToHex = new Array<string>(256);
for (let i = 0; i < 256; i++) {
  byteToHex[i] = (i + 0x100).toString(16).substring(1).toLowerCase();
}

export function unsafeStringify(arr: Uint8Array, offset = 0): string {
  return [
    byteToHex[arr[offset]],
    byteToHex[arr[offset + 1]],
    byteToHex[arr[offset + 2]],
    byteToHex[arr[offset + 3]],
    "-",
    byteToHex[arr[offset + 4]],
    byteToHex[arr[offset + 5]],
    "-",
    byteToHex[arr[offset + 6]],
    byteToHex[arr[offset + 7]],
    "-",
    byteToHex[arr[offset + 8]],
    byteToHex[arr[offset + 9]],
    "-",
    byteToHex[arr[offset + 10]],
    byteToHex[arr[offset + 11]],
    byteToHex[arr[offset + 12]],
    byteToHex[arr[offset + 13]],
    byteToHex[arr[offset + 14]],
    byteToHex[arr[offset + 15]],
  ].join("");
}

function generateUUID(options?: Options, buf?: Uint8Array, offset?: number): UUIDTypes {

  const rnds = options?.random ?? options?.rng?.() ?? rng();

  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }

  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    buf.set(rnds.subarray(0, 16), offset);
    return buf;
  }

  return unsafeStringify(rnds);
}

const ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CHAR_LENGTH = ALPHANUMERIC_CHARS.length;

function generateRandomAlphanumeric(length: number): string {

  const bytes = sodium.randombytes_buf(length);
  const result = new Array<string>(length);

  for (let i = 0; i < length; i++) {
    result[i] = ALPHANUMERIC_CHARS[bytes[i] % CHAR_LENGTH];
  }

  return result.join("");
}

function generateUniqueId(prefix = "", suffix = "", length = 16): string {
  const timestamp = Date.now().toString(36);
  const subMs = typeof performance !== "undefined"
    ? Math.floor(performance.now() * 1000).toString(36)
    : sodium.randombytes_uniform(1000000).toString(36).substring(0, 6);

  const fixedParts = [prefix, timestamp, subMs, suffix].filter(Boolean);
  const fixedLength = fixedParts.reduce((sum, part) => sum + part.length, 0) + Math.max(fixedParts.length - 1, 0);
  const randomLength = Math.max(length - fixedLength, 1);

  const randomPart = generateRandomAlphanumeric(randomLength);
  return [prefix, timestamp, subMs, randomPart, suffix].filter(Boolean).join("-").substring(0, length);
}

function useUniqueId(prefix = "", suffix = "", length = 16): string {
  const idRef = useRef<string>(generateUniqueId(prefix, suffix, length));
  const depsRef = useRef<[string, string, number]>([prefix, suffix, length]);

  if (
    depsRef.current[0] !== prefix ||
    depsRef.current[1] !== suffix ||
    depsRef.current[2] !== length
  ) {
    idRef.current = generateUniqueId(prefix, suffix, length);
    depsRef.current = [prefix, suffix, length];
  }

  return idRef.current;
}

export default useUniqueId;
export { generateUniqueId, generateUUID };
