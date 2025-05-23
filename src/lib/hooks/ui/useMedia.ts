import { useEffect, useState } from 'react';
import { IS_BROWSER } from '@/lib/core';

const getInitialState = (query: string, defaultState?: boolean) => {
  if (defaultState !== undefined) {
    return defaultState;
  }

  if (IS_BROWSER) {
    return window.matchMedia(query).matches;
  }

  return false;
};

const useMedia = (query: string, defaultState?: boolean) => {
  const [state, setState] = useState(getInitialState(query, defaultState));

  useEffect(() => {
    let isMounted = true;

    const matchMediaQuery = window.matchMedia(query);
    const onChange = () => {
      if (!isMounted) {
        return;
      }
      setState(!!matchMediaQuery.matches);
    };

    matchMediaQuery.addEventListener('change', onChange);
    setState(matchMediaQuery.matches);

    return () => {
      isMounted = false;
      matchMediaQuery.removeEventListener('change', onChange);
    };
  }, [query]);

  return state;
};

export default useMedia;
