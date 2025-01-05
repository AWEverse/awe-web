import { useEffect, useRef } from 'react';

function generateUniqueId(prefix: string = '', suffix: string = ''): string {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);

  const uniquePart = Array.from(array, num => num.toString(36)).join('');

  return `${prefix}-${uniquePart}-${suffix}`;
}

function useUniqueId(prefix: string = '', suffix: string = ''): string {
  const idRef = useRef<string>('');

  useEffect(() => {
    idRef.current = generateUniqueId(prefix, suffix);
  }, [prefix, suffix]);

  return idRef.current;
}

export default useUniqueId;
export { generateUniqueId };
