import { useRef, useLayoutEffect } from "react";

const useLayoutEffectWithPreviousDeps = <const T extends readonly unknown[]>(
  cb: (args: T | readonly []) => void,
  dependencies: T,
) => {
  const prevDepsRef = useRef<T>(null);

  return useLayoutEffect(() => {
    const prevDeps = prevDepsRef.current;
    prevDepsRef.current = dependencies;

    return cb(prevDeps || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export default useLayoutEffectWithPreviousDeps;
