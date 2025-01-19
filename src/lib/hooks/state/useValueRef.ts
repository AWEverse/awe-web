import { useRef } from "react";
import useStableCallback from "../callbacks/useStableCallback";

export default function useValueRef<T>(
  initialValue: T,
): [Readonly<T>, (newValue: T) => void] {
  const ref = useRef<T>(initialValue);

  const setValue = useStableCallback((newValue: T) => {
    ref.current = newValue;
  });

  return [ref.current as Readonly<T>, setValue];
}
