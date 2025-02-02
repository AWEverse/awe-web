import { useRef } from "react";

const BASE36_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

function generateRandomString(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE36_CHARS[Math.floor(Math.random() * 36)];
  }
  return result;
}

function generateUniqueId(
  prefix: string = "",
  suffix: string = "",
  length: number = 16,
): string {
  const timestamp = Date.now().toString(36);
  const fixedPart = `${prefix}${timestamp}${suffix}`;
  const separatorCount = [prefix, timestamp, suffix].filter(Boolean).length - 1;
  const fixedLength = fixedPart.length + separatorCount;

  const randomLength = Math.max(length - fixedLength, 1);

  const randomPart = generateRandomString(randomLength);

  const parts = [prefix, timestamp, randomPart, suffix].filter(Boolean);
  return parts.join("-").slice(0, length);
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
export { generateUniqueId };
