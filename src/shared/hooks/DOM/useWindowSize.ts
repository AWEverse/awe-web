import { useState, useEffect, useRef, useMemo } from "react";
import { useStableCallback } from "../base";
import { useDebouncedFunction } from "../shedulers";

type WindowSize = {
  width: number;
  height: number;
  isResizing: boolean;
};

const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  const isResizing = useRef(false);
  const animationFrame = useRef<number>(0);
  const lastUpdate = useRef(Date.now());
  const debounceMs = 250;

  const handleResize = useStableCallback(() => {
    if (!isResizing.current) {
      isResizing.current = true;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdate.current;

    if (timeSinceLastUpdate >= debounceMs) {
      lastUpdate.current = now;

      console.log("window resize");

      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      isResizing.current = false;
    });
  });

  const debouncedResizeHandler = useDebouncedFunction(
    handleResize,
    debounceMs,
    true,
    false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("resize", debouncedResizeHandler, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", debouncedResizeHandler);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [debouncedResizeHandler]);

  return useMemo(
    () => ({
      ...size,
      isResizing: isResizing.current,
    }),
    [size.width, size.height, isResizing.current],
  );
};

export default useWindowSize;
