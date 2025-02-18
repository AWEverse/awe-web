import { useRef } from "react";

export type UUIDTypes = string | Uint8Array;

export type Options = {
  random?: Uint8Array;
  rng?: () => Uint8Array;
};

// Use larger pool size to reduce refill frequency
const rnds8Pool = new Uint8Array(1024); // Increased from 256 to 1024
let poolPtr = rnds8Pool.length;

const getRandomValues = typeof window !== 'undefined' && window.crypto
  ? window.crypto.getRandomValues.bind(window.crypto)
  : null;
const canUseCryptoUUID = typeof window !== 'undefined' && window.crypto?.randomUUID;

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    if (getRandomValues) {
      getRandomValues(rnds8Pool);
    } else {
      throw new Error('Secure random number generator not available');
    }
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}

const byteToHex = new Array<string>(256);
for (let i = 0; i < 256; i++) {
  byteToHex[i] = (i + 0x100).toString(16).substring(1).toLowerCase();
}

export function unsafeStringify(arr: Uint8Array, offset = 0): string {
  const parts = new Array<string>(36);
  let i = 0;

  // Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  parts[i++] = byteToHex[arr[offset]];
  parts[i++] = byteToHex[arr[offset + 1]];
  parts[i++] = byteToHex[arr[offset + 2]];
  parts[i++] = byteToHex[arr[offset + 3]];
  parts[i++] = '-';
  parts[i++] = byteToHex[arr[offset + 4]];
  parts[i++] = byteToHex[arr[offset + 5]];
  parts[i++] = '-';
  parts[i++] = byteToHex[arr[offset + 6]];
  parts[i++] = byteToHex[arr[offset + 7]];
  parts[i++] = '-';
  parts[i++] = byteToHex[arr[offset + 8]];
  parts[i++] = byteToHex[arr[offset + 9]];
  parts[i++] = '-';
  parts[i++] = byteToHex[arr[offset + 10]];
  parts[i++] = byteToHex[arr[offset + 11]];
  parts[i++] = byteToHex[arr[offset + 12]];
  parts[i++] = byteToHex[arr[offset + 13]];
  parts[i++] = byteToHex[arr[offset + 14]];
  parts[i++] = byteToHex[arr[offset + 15]];

  return parts.join('');
}

function generateUUID(options?: Options, buf?: Uint8Array, offset?: number): UUIDTypes {
  if (canUseCryptoUUID && !buf && !options) {
    return window.crypto.randomUUID();
  }

  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();

  if (rnds.length < 16) {
    throw new Error('Random bytes length must be >= 16');
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

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CHAR_LENGTH = ALPHANUMERIC_CHARS.length;

function generateRandomAlphanumeric(length: number): string {
  const bytes = new Uint8Array(length);

  if (getRandomValues) {
    getRandomValues(bytes);
  } else {
    throw new Error('Secure random number generator not available');
  }

  const result = new Array<string>(length);

  for (let i = 0; i < length; i++) {
    result[i] = ALPHANUMERIC_CHARS[bytes[i] % CHAR_LENGTH];
  }

  return result.join('');
}

function generateUniqueId(
  prefix: string = "",
  suffix: string = "",
  length: number = 16,
): string {
  const timestamp = Date.now().toString(36);
  const subMs = typeof performance !== 'undefined'
    ? Math.floor(performance.now() * 1000).toString(36)
    : Math.random().toString(36).substring(2, 8);

  const fixedParts = [prefix, timestamp, subMs, suffix].filter(Boolean);
  const fixedLength = fixedParts.sum(part => part.length) + Math.max(fixedParts.length - 1, 0);
  const randomLength = Math.max(length - fixedLength, 1);

  const randomPart = generateRandomAlphanumeric(randomLength);
  const parts: string[] = [];

  let i = 0;
  if (prefix) parts[i++] = prefix;
  if (timestamp) parts[i++] = timestamp;
  if (subMs) parts[i++] = subMs;
  parts[i++] = randomPart;
  if (suffix) parts[i] = suffix;

  return parts.join('-').substring(0, length);
}

function useUniqueId(
  prefix: string = "",
  suffix: string = "",
  length: number = 16,
): string {
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
