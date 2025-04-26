import { LRUCache } from 'lru-cache';
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

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i); // hash * 33 XOR char
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

function hashObject(obj: { [key: string]: ClassValue }): number {
  let hash = 5381;

  const keys = Object.keys(obj);
  keys.sort();

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (obj[key]) {
      hash = ((hash << 5) + hash) ^ hashString(key);
    }
  }

  return hash >>> 0;
}

const hashCache = new WeakMap<object, number>();

function hash(parts: Parts, depth: number = 0): number {
  if (depth > 5) return 0;

  let result = 5381;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === null || part === undefined) continue;

    if (typeof part === 'object' && part !== null) {
      let objHash = hashCache.get(part);

      if (objHash === undefined) {
        if (Array.isArray(part)) {
          objHash = hash(part, depth + 1);
        } else {
          objHash = hashObject(part as { [key: string]: ClassValue });
        }
        hashCache.set(part, objHash);
      }

      result = ((result << 5) + result) ^ objHash;
      continue;
    }

    if (typeof part === 'string') {
      result = ((result << 5) + result) ^ hashString(part);
    } else if (typeof part === 'number') {
      result = ((result << 5) + result) ^ (part | 0);
    } else if (typeof part === 'boolean') {
      result = ((result << 5) + result) ^ (part ? 1 : 0);
    }
  }

  return result >>> 0;
}

const BUFFER_SIZE = 128;
const classBuffer = new Array<string>(BUFFER_SIZE);

function processClassNames(parts: Parts): string {
  let bufferSize = BUFFER_SIZE;
  let buffer = classBuffer;
  if (parts.length > BUFFER_SIZE / 2) {
    bufferSize = parts.length * 2;
    buffer = new Array<string>(bufferSize);
  }

  let index = 0;
  const seen = new Set<string>();

  function processPart(part: ClassValue): void {
    if (part === null || part === undefined) return;

    if (Array.isArray(part)) {
      for (let i = 0; i < part.length; i++) {
        processPart(part[i]);
      }
      return;
    }

    if (typeof part === 'string') {
      if (part && !seen.has(part)) {
        seen.add(part);
        buffer[index++] = part;
      }
      return;
    }

    if (typeof part === 'number' || typeof part === 'boolean') {
      const str = String(part);
      if (!seen.has(str)) {
        seen.add(str);
        buffer[index++] = str;
      }
      return;
    }

    if (typeof part === 'object') {
      const obj = part as { [key: string]: ClassValue };
      for (const key in obj) {
        if (obj[key] && !seen.has(key)) {
          seen.add(key);
          buffer[index++] = key;
        }
      }
    }
  }

  for (let i = 0; i < parts.length; i++) {
    processPart(parts[i]);
  }

  return buffer.slice(0, index).join(' ');
}

type CacheConfig = {
  max: number;
  ttl?: number;
  updateAgeOnGet?: boolean;
};

const HOOK_CACHE_CONFIG: CacheConfig = {
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
};

const STATIC_CACHE_CONFIG: CacheConfig = {
  max: 1000,
  ttl: 1000 * 60 * 30, // 30 minutes
  updateAgeOnGet: false,
};


export function useClassNameBuilder(): (...parts: Parts) => string {
  const cache = useMemo(() => new LRUCache<number, string>(HOOK_CACHE_CONFIG), []);

  return (...parts: Parts): string => {
    const hashKey = hash(parts);
    const cachedResult = cache.get(hashKey);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const result = processClassNames(parts);
    cache.set(hashKey, result);
    return result;
  };
}

const staticCache = new LRUCache<number, string>(STATIC_CACHE_CONFIG);

export default function buildClassName(...parts: Parts): string {
  const hashKey = hash(parts);
  const cachedResult = staticCache.get(hashKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result = processClassNames(parts);
  staticCache.set(hashKey, result);
  return result;
}
