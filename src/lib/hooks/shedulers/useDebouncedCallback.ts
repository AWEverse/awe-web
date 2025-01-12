import { debounce } from '@/lib/core';
import { useCallback, useMemo } from 'react';

export default function useDebouncedCallback<T extends AnyToVoidFunction>(
  fn: T,
  deps: any[],
  ms: number,
  noFirst = false,
  noLast = false,
) {
  // eslint-disable-next-line react-hooks-static-deps/exhaustive-deps
  const fnMemo = useCallback(fn, deps);

  return useMemo(() => debounce(fnMemo, ms, !noFirst, !noLast), [fnMemo, ms, noFirst, noLast]);
}
