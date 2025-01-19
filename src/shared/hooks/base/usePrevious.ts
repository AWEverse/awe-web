import { useRef } from "react";

/**
 * Custom hook to store and retrieve the previous value of a variable.
 *
 * This hook stores the previous value of a given variable, allowing you to
 * compare the current and previous values.
 * It updates the previous value only when the current value changes.
 *
 * @param current The current value that needs to be tracked.
 * @returns The previous value of the input, or undefined if there was no previous value.
 */
export default function <T>(current: T): T | undefined {
  const prevRef = useRef<T>(undefined);
  const lastRef = useRef<T>(undefined);

  // Update the previous value only if the current value has changed
  if (lastRef.current !== current) {
    prevRef.current = lastRef.current;
  }

  lastRef.current = current;

  return prevRef.current;
}
