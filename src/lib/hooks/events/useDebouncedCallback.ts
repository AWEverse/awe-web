import { debounce } from '@/lib/utils/schedulers';
import { useCallback, useMemo } from 'react';

export default function useDebouncedCallback<T extends AnyToVoidFunction>(
  fn: T,
  deps: React.DependencyList = [],
  ms: number = 500,
  noFirst = false,
  noLast = false,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fnMemo = useCallback(fn, deps);

  return useMemo(() => {
    return debounce(fnMemo, ms, !noFirst, !noLast);
  }, [fnMemo, ms, noFirst, noLast]);
}
