import { useEffect } from "react";

import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";

function useInterval(
  callback: NoneToVoidFunction,
  delay?: number,
  noFirst = false,
) {
  const savedCallback = useStableCallback(callback);

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
