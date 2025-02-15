import memoizee from "memoizee";
import { useCallback, Ref, MutableRefObject, RefObject, useMemo } from "react";

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
const useMergedRefs = (): ReturnType<typeof createRefMerger> =>
  useMemo(createRefMerger, []);;

export function refMerger<T>(
  ...refs: Array<Ref<unknown>>
): (topLevelRef: T) => void {
  return (el: T) => {
    refs.forEach(ref => {
      // This is a simplified version of [what React does][0] to set a ref.
      // [0]: https://github.com/facebook/react/blob/29b7b775f2ecf878eaf605be959d959030598b07/packages/react-reconciler/src/ReactFiberCommitWork.js#L661-L677
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        // I believe the types for `ref` are wrong in this case, as `ref.current` should
        //   not be `readonly`. That's why we do this cast. See [the React source][1].
        // [1]: https://github.com/facebook/react/blob/29b7b775f2ecf878eaf605be959d959030598b07/packages/shared/ReactTypes.js#L78-L80
        (ref as Mutable<RefObject<T>>).current = el;
      }
    });
  };
}

export function createRefMerger(): typeof refMerger {
  return memoizee(refMerger, { length: false, max: 1 });
}

export default useMergedRefs;
