import { RefObject, useRef } from "react";

// Allows to use state value as "silent" dependency in hooks (not causing updates).
// Also useful for state values that update frequently (such as controlled input value).

/**
 * A custom hook that stores a value in a mutable ref object and ensures the ref
 * is updated whenever the value changes.
 *
 * This hook is useful when you want to keep track of a value across renders
 * without causing re-renders when the value itself changes. It returns a stable
 * ref object that will always contain the latest value, while not triggering
 * re-renders when the value changes.
 *
 * @param value - The value to store in the ref object. This value can be any type.
 *
 * @returns {Readonly<RefObject<T>>} The ref object that holds the current value.
 * - `current`: The stored value, which will be updated when `value` changes.
 */
export default function useStateRef<T>(value: T): Readonly<RefObject<T>> {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
