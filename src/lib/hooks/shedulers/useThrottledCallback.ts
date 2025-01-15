import { Scheduler, throttle, throttleWith } from '@/lib/core';
import { useCallback, useMemo } from 'react';

export default function useThrottledCallback<T extends AnyToVoidFunction>(
  fn: T,
  deps: any[],
  msOrSchedulerFn: number | Scheduler,
  noFirst = false,
) {
  // eslint-disable-next-line react-hooks-static-deps/exhaustive-deps
  const fnMemo = useCallback(fn, deps);

  return useMemo(() => {
    if (typeof msOrSchedulerFn === 'number') {
      return throttle(fnMemo, msOrSchedulerFn, !noFirst);
    } else {
      return throttleWith(msOrSchedulerFn, fnMemo);
    }
  }, [fnMemo, msOrSchedulerFn, noFirst]);
}
