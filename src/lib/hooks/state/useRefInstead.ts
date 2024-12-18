import { RefObject, useRef } from 'react';

const useRefInstead = <T>(ref?: RefObject<T>): RefObject<T> => {
  const internalRef = useRef<T>(null);

  if (!ref) {
    return internalRef;
  }

  return ref;
};

export default useRefInstead;
