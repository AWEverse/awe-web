import { useRef } from 'react';

function generateUniqueId(prefix: string = '', suffix: string = ''): string {
  const uniquePart = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  return `${prefix}-${uniquePart}-${suffix}`;
}

function useUniqueId(prefix: string = '', suffix: string = ''): string {
  const idRef = useRef<string>();

  if (!idRef.current) {
    idRef.current = generateUniqueId(prefix, suffix);
  }

  return idRef.current;
}

export default useUniqueId;
export { generateUniqueId };
