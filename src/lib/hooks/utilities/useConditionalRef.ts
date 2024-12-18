import { useMemo, type DependencyList, type RefObject } from 'react';

export default function useConditionalRef<T>(value: T | null, deps: DependencyList): RefObject<T> {
  const ref = useMemo(() => ({ current: value }), [...deps, value]);

  return ref as RefObject<T>;
}
