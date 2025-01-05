import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function <const T extends Readonly<AnyArray>>(
  cb: (args: T | readonly []) => void,
  dependencies: T,
) {
  const prevDepsRef = useRef<T>(null);

  return useEffect(() => {
    const prevDeps = prevDepsRef.current;

    prevDepsRef.current = dependencies;

    return cb(prevDeps || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
