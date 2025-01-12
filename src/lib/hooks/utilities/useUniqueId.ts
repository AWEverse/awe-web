import { useEffect, useRef } from 'react';

function toBase36(num: number, length: number): string {
  return num.toString(36).padStart(length, '0');
}

function generateUniqueId(prefix: string = '', suffix: string = '', length: number = 16): string {
  const now = Date.now();

  const array = new Uint32Array(4);
  crypto.getRandomValues(array);

  const timePart = toBase36(now, 8);
  const randomPart = Array.from(array, num => toBase36(num, 8))
    .join('')
    .slice(0, length - 8);

  return `${prefix}-${timePart}-${randomPart}-${suffix}`;
}

function useUniqueId(prefix: string = '', suffix: string = '', length: number = 16): string {
  const idRef = useRef<string>('');

  useEffect(() => {
    idRef.current = generateUniqueId(prefix, suffix, length);
  }, [prefix, suffix, length]);

  return idRef.current;
}

export default useUniqueId;
export { generateUniqueId };
