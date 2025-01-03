import { useRef } from 'react';

function generateUniqueId(prefix: string = '', suffix: string = ''): string {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);

  const uniquePart = Array.from(array, num => num.toString(36)).join('');

  return `${prefix}-${uniquePart}-${suffix}`;
}

function useUniqueId(prefix: string = '', suffix: string = ''): string {
  const idRef = useRef<string>('');

  if (!idRef.current) {
    idRef.current = generateUniqueId(prefix, suffix);
  }

  return idRef.current;
}

export default useUniqueId;
export { generateUniqueId };
