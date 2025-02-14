import { useRef } from "react";

/**
 * Generates a cryptographically strong random string of a given length using Base64 encoding.
 */
function generateRandomString(length: number): string {
  const randomBytes = new Uint8Array(Math.ceil((length * 6) / 8)); // 6 bits per Base64 char
  crypto.getRandomValues(randomBytes);
  let result = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_") // Replace '/' with '_'
    .replace(/=/g, ""); // Remove padding '='
  return result.slice(0, length); // Truncate to desired length
}

/**
 * Generates a unique ID with optional prefix, suffix, and length constraints.
 */
function generateUniqueId(
  prefix: string = "",
  suffix: string = "",
  length: number = 16,
): string {
  const timestamp = Date.now().toString(36);

  const subMillisecond = Math.floor(performance.now() * 1000).toString(36);
  const fixedPart = `${prefix}${timestamp}${subMillisecond}${suffix}`;
  const separatorCount =
    [prefix, timestamp, subMillisecond, suffix].filter(Boolean).length - 1;
  const fixedLength = fixedPart.length + separatorCount;
  const randomLength = Math.max(length - fixedLength, 1);

  const randomPart = generateRandomString(randomLength);

  const parts = [prefix, timestamp, subMillisecond, randomPart, suffix].filter(
    Boolean,
  );
  return parts.join("-").slice(0, length);
}

/**
 * React hook to generate and memoize a unique ID.
 */
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
export { generateUniqueId };
