import { useMemo } from 'react';

/**
 * Type for valid class name values.
 */
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | { [key: string]: ClassValue };

/**
 * An array of class name values.
 */
export type Parts = ClassValue[];

/**
 * Utility for MurmurHash3 hashing algorithm (32-bit version).
 *
 * @param {string} key - The input string to hash.
 * @param {number} seed - Optional seed for the hash.
 * @returns {number} A 32-bit hash of the input string.
 */
function murmurHash3(key: string, seed: number = 0): number {
  let h1 = seed ^ key.length;

  for (let i = 0; i < key.length; i++) {
    let k1 = key.charCodeAt(i);
    k1 = (k1 * 0xcc9e2d51) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17); // Rotate left 15 bits
    k1 = (k1 * 0x1b873593) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19); // Rotate left 13 bits
    h1 = (h1 * 5 + 0xe6546b64) & 0xffffffff;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = (h1 * 0x85ebca6b) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = (h1 * 0xc2b2ae35) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

/**
 * Generates a fast hash for an object by iterating over its own enumerable properties.
 *
 * @param {object} obj - The object to hash.
 * @returns {string} The hash representing the object's truthy keys.
*/
function fastHashObject(obj: { [key: string]: ClassValue }): string {
  let combined = 0;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key]) {
      // Compute a simple hash for the key using DJB2 algorithm.
      let keyHash = 5381;
      for (let i = 0, len = key.length; i < len; i++) {
        keyHash = ((keyHash << 5) + keyHash) + key.charCodeAt(i); // keyHash * 33 + char
      }
      combined ^= keyHash;
    }
  }
  return '|o:' + (combined >>> 0).toString(36);
}

/**
 * Computes a fast hash from various input parts.
 *
 * @param {Parts} parts - The array of class name parts to hash.
 * @param {number} depth - Recursion depth to prevent infinite loops.
 * @param {Map<any, string>} cacheRefs - A map for caching object hashes.
 * @returns {string} A unique hash string.
 */
function fastHash(parts: Parts, depth: number = 0, cacheRefs: Map<any, string> = new Map<any, string>()): string {
  if (depth > 10) return '|depth:exceeded';

  const result: string[] = [];
  for (const part of parts) {
    if (part === null || part === undefined) continue;

    if (Array.isArray(part)) {
      result.push('|a:', fastHash(part, depth + 1, cacheRefs));
      continue;
    }

    const type = typeof part;
    if (type === 'string' || type === 'number') {
      result.push(type === 'string' ? '|s:' : '|n:', part.toString());
    } else if (type === 'boolean') {
      result.push(part ? '|b:1' : '|b:0');
    } else if (type === 'object') {
      const cachedHash = cacheRefs.get(part);
      if (cachedHash) {
        result.push(cachedHash);
      } else if (typeof part === "object" && part !== null) {
        const objectHash = fastHashObject(part);
        cacheRefs.set(part, objectHash);
        result.push(objectHash);
      }
    }
  }
  return result.join('');
}

/**
 * Processes a class value and adds valid class names to the output array.
 *
 * @param {ClassValue} part - The class value to process.
 * @param {string[]} out - The output array for class names.
 */
function processPart(part: ClassValue, out: string[]): void {
  if (part === null || part === undefined) return;

  if (Array.isArray(part)) {
    for (const subPart of part) {
      processPart(subPart, out);
    }
    return;
  }

  const type = typeof part;
  if (type === 'string' || type === 'number') {
    const str = String(part);
    if (str) {
      out.push(str);
    }
  } else if (type === 'object' && part !== null) {
    for (const [key, value] of Object.entries(part)) {
      if (value) {
        out.push(key);
      }
    }
  }
}

/**
 * Custom React hook for building class names with caching.
 *
 * @returns {(...parts: Parts) => string} A function that generates and caches class names.
 */
export function useClassNameBuilder(): (...parts: Parts) => string {
  const cache = useMemo(() => new Map<number, string>(), []);
  console.log(cache);

  return (...parts: Parts): string => {
    const key = murmurHash3(fastHash(parts));

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const classNames: string[] = [];
    for (const part of parts) {
      processPart(part, classNames);
    }

    const result = classNames.join(' ');
    cache.set(key, result);

    // Evict the oldest cache entry if exceeding a size limit
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  };
}

/**
 * Builds a class name string from various parts without caching.
 *
 * @param {...Parts} parts - A list of class name parts.
 * @returns {string} A concatenated class name string.
 */
export default function buildClassName(...parts: Parts): string {
  const classNames: string[] = [];
  for (const part of parts) {
    processPart(part, classNames);
  }
  return classNames.join(' ');
}
