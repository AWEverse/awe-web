import murmurHash2 from '@/lib/core/public/cryptography/utils/murmurHash2';
import { useMemo } from 'react';

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | { [key: string]: ClassValue };

export type Parts = ClassValue[];

// Optimized fast hash for objects using a single-pass DJB2-like algorithm
function fastHashObject(obj: { [key: string]: ClassValue }): number {
  let hash = 5381;

  for (const key in obj) {
    if (obj[key] && Object.prototype.hasOwnProperty.call(obj, key)) {
      let keyHash = 0;
      for (let i = 0, len = key.length; i < len; i++) {
        keyHash = (keyHash * 33) ^ key.charCodeAt(i);
      }
      hash = (hash * 33) ^ keyHash;
    }
  }
  return hash >>> 0;
}

function fastHash(parts: Parts, depth: number = 0, cacheRefs: Map<any, number> = new Map()): number {
  if (depth > 10) return 0xDEAD;

  let hash = 0;
  for (let i = 0, len = parts.length; i < len; ++i) {
    const part = parts[i];
    if (part === null || part === undefined) continue;

    if (Array.isArray(part)) {
      hash = (hash * 31) ^ fastHash(part, depth + 1, cacheRefs);
      continue;
    }

    const type = typeof part;
    if (type === 'string') {
      let strHash = 0;
      const str = part as string;
      for (let j = 0, len = str.length; j < len; j++) {
        strHash = (strHash * 33) ^ str.charCodeAt(j);
      }
      hash = (hash * 31) ^ strHash;
    } else if (type === 'number') {
      hash = (hash * 31) ^ (part as number | 0);
    } else if (type === 'boolean') {
      hash = (hash * 31) ^ (part ? 1 : 0);
    } else if (type === 'object') {
      const cachedHash = cacheRefs.get(part);
      if (cachedHash !== undefined) {
        hash = (hash * 31) ^ cachedHash;
      } else {
        const objectHash = fastHashObject(part as { [key: string]: ClassValue });
        cacheRefs.set(part, objectHash);
        hash = (hash * 31) ^ objectHash;
      }
    }
  }
  return hash >>> 0;
}

function processPart(part: ClassValue, out: string[], offset: number): number {
  if (part === null || part === undefined) return offset;

  if (Array.isArray(part)) {
    for (let i = 0, len = part.length; i < len; ++i) {
      offset = processPart(part[i], out, offset);
    }
    return offset;
  }

  const type = typeof part;
  if (type === 'string' || type === 'number') {
    const str = String(part);
    if (str) {
      out[offset++] = str;
    }
  } else if (type === 'object' && part !== null && !Array.isArray(part)) {
    const obj = part as { [key: string]: ClassValue };
    const keys = Object.keys(obj);

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (obj[key]) {
        out[offset++] = key;
      }
    }
  }
  return offset;
}

export function useClassNameBuilder(): (...parts: Parts) => string {
  const cache = useMemo(() => new Map<number, string>(), []);

  return (...parts: Parts): string => {
    const key = murmurHash2(fastHash(parts).toString(), 32);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const classNames = new Array<string>(parts.length * 2);
    let length = 0;

    for (let i = 0, len = parts.length; i < len; ++i) {
      length = processPart(parts[i], classNames, length);
    }

    const result = classNames.slice(0, length).join(' ');
    cache.set(key, result);

    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }

    return result;
  };
}

export default function buildClassName(...parts: Parts): string {
  const classNames = new Array<string>(parts.length * 2);
  let length = 0;

  for (let i = 0, len = parts.length; i < len; ++i) {
    length = processPart(parts[i], classNames, length);
  }

  return classNames.slice(0, length).join(' ');
}
