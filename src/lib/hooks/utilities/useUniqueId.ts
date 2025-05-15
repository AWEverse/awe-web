import { useRef, useMemo } from "react";

const HEX_CHARS = Array.from({ length: 256 }).map((_, i) => (i + 0x100).toString(16).substring(1).toLowerCase());
const UUID_TEMPLATE = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

function getRandomBytes(length: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(length));
  }
  if (typeof window !== 'undefined') {
    try {
      const sodium = require('libsodium-wrappers');
      return sodium.randombytes_buf(length);
    } catch {
      const result = new Uint8Array(length);
      for (let i = 0; i < length; i++) result[i] = Math.floor(Math.random() * 256);
      return result;
    }
  }
  try {
    const crypto = require('crypto');
    return new Uint8Array(crypto.randomBytes(length));
  } catch {
    throw new Error('No secure random source available');
  }
}

export function generateUUID(): string {
  const rnds = getRandomBytes(16);
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  return UUID_TEMPLATE.replace(/[xy]/g, (c, i) => {
    const r = rnds[i >> 1];
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return HEX_CHARS[v];
  });
}

export function generateBinaryUUID(): Uint8Array {
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes;
}

const ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CHAR_LENGTH = ALPHANUMERIC_CHARS.length;

function generateRandomAlphanumeric(length: number): string {
  const bytes = getRandomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC_CHARS[bytes[i] % CHAR_LENGTH];
  }
  return result;
}

const timestampCache = { value: '', expiry: 0 };

function getCachedTimestamp(): string {
  const now = Date.now();
  if (now - timestampCache.expiry > 5) {
    timestampCache.value = now.toString(36);
    timestampCache.expiry = now;
  }
  return timestampCache.value;
}

export function generateUniqueId(prefix = "", suffix = "", length = 16): string {
  const timestamp = getCachedTimestamp();
  const subMs = typeof performance !== "undefined"
    ? ((performance.now() * 1000) | 0).toString(36)
    : (getRandomBytes(2)[0] << 8 | getRandomBytes(2)[1]).toString(36);
  const prefixLen = prefix ? prefix.length + 1 : 0;
  const suffixLen = suffix ? suffix.length + 1 : 0;
  const timestampLen = timestamp.length;
  const subMsLen = subMs.length;
  const randomLength = Math.max(length - prefixLen - timestampLen - subMsLen - suffixLen, 1);
  const randomPart = generateRandomAlphanumeric(randomLength);
  let result = prefix ? prefix + "-" : "";
  result += timestamp;
  result += "-" + subMs;
  result += "-" + randomPart;
  result += suffix ? "-" + suffix : "";
  return result.length > length ? result.substring(0, length) : result;
}

export function useUniqueId(prefix = "", suffix = "", length = 16): string {
  const depsRef = useRef<[string, string, number]>([prefix, suffix, length]);
  const idRef = useRef<string>("");
  const id = useMemo(() => {
    const [prevPrefix, prevSuffix, prevLength] = depsRef.current;
    if (
      prevPrefix !== prefix ||
      prevSuffix !== suffix ||
      prevLength !== length
    ) {
      depsRef.current = [prefix, suffix, length];
      idRef.current = generateUniqueId(prefix, suffix, length);
    } else if (!idRef.current) {
      idRef.current = generateUniqueId(prefix, suffix, length);
    }
    return idRef.current!;
  }, [prefix, suffix, length]);
  return id;
}

export default useUniqueId;
