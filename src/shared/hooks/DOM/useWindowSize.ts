import { useEffect, useState } from "react";
import windowSize from "@/lib/utils/windowSize";

type WindowSize = {
  height: number;
  width: number;
};


const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>(windowSize.dimensions);

  useEffect(() => {
    setSize(windowSize.dimensions);
  }, [windowSize.dimensions])

  return size;
};

export default useWindowSize;
