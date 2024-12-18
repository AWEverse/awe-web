import { useEffect } from 'react';

import useLastCallback from '@/lib/hooks/events/useLastCallback';

function useTimeout(callback: NoneToVoidFunction, delay?: number) {
  const savedCallback = useLastCallback(callback);

  useEffect(() => {
    if (typeof delay !== 'number') {
      return undefined;
    }

    const id = setTimeout(() => savedCallback(), delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
}

export default useTimeout;
