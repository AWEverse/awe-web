import { RefObject, useRef } from "react";

/**
 * A custom hook that returns a `RefObject`. If a `ref` is passed in, it returns the provided `ref`.
 * Otherwise, it creates and returns a new internal `ref` using `useRef`.
 *
 * This hook is useful when you need to provide a fallback `ref` internally or share a `ref`
 * across components without modifying the original `ref`.
 *
 * @param {RefObject<T | null>} [ref] - An optional `RefObject` that may be passed in. If provided, it will be returned.
 * @returns {RefObject<T | null>} The provided `ref` or a new internal `ref` if no `ref` is passed.
 *
 * @template T - The type of the referenced element.
 */
export default function <T>(ref?: RefObject<T>): RefObject<T | null> {
  // Create an internal ref if no ref is provided
  const internalRef = useRef<T>(null);

  // Return the provided ref or the internal one if no ref is given
  if (!ref) {
    return internalRef;
  }

  return ref;
}
