import { useEffect } from 'react';

import useLastCallback from '@/lib/hooks/events/useLastCallback';

function useInterval(callback: NoneToVoidFunction, delay?: number, noFirst = false) {
  const savedCallback = useLastCallback(callback);

  useEffect(() => {
    if (delay === undefined) {
      return undefined;
    }

    const id = setInterval(() => savedCallback(), delay);
    if (!noFirst) savedCallback();

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, noFirst]);
}

export default useInterval;
