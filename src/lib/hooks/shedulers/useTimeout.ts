import { useEffect } from "react";

import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";

function useTimeout(callback: NoneToVoidFunction, delay?: number) {
  const savedCallback = useStableCallback(callback);

  useEffect(() => {
    if (typeof delay !== "number") {
      return undefined;
    }

    const id = setTimeout(() => savedCallback(), delay);
    return () => {
      clearTimeout(id);
    };
  }, [delay]);
}

export default useTimeout;
