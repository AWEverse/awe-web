import { RefObject, useRef } from 'react';

const useRefInstead = <T>(ref?: RefObject<T | null>): RefObject<T | null> => {
  const internalRef = useRef<T>(null);

  if (!ref) {
    return internalRef;
  }

  return ref;
};

export default useRefInstead;
