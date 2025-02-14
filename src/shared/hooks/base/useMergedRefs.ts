import { useCallback, Ref } from "react";

/**
 * A modern hook that merges multiple refs (object refs or callback refs) into a single callback ref.
 *
 * When the ref callback is invoked with a node, it assigns that node to every provided ref.
 * This is especially useful when forwarding refs while also maintaining an internal ref.
 *
 * @template T - The type of the referenced element.
 * @param refs - The refs to merge.
 * @returns A callback ref that assigns the node to each provided ref.
 *
 * @example
 * import React, { useRef, forwardRef } from 'react';
 * import { useMergedRefs } from './useMergedRefs';
 *
 * interface MyComponentProps {
 *   // other props...
 * }
 *
 * // Forward the ref from the parent while also using an internal ref.
 * const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>((props, ref) => {
 *   const internalRef = useRef<HTMLDivElement>(null);
 *   const mergedRef = useMergedRefs(ref, internalRef);
 *
 *   return <div ref={mergedRef}>Hello, World!</div>;
 * });
 *
 * export default MyComponent;
 */
export default function useMergedRefs<T>(
  ...refs: Array<Ref<T> | null | undefined>
): (node: T | null) => void {
  return useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (!ref) continue;
        if (typeof ref === "function") {
          ref(node);
        } else if ("current" in ref) {
          ref.current = node;
        }
      }
    },
    [...refs],
  );
}
