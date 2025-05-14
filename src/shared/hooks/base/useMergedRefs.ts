import { Ref, useCallback } from "react";

/**
 * Merges multiple refs (object refs or callback refs) into a single callback ref.
 * @template T - The type of the referenced element.
 * @param refs - The refs to merge.
 * @returns A callback ref that assigns the node to each provided ref.
 */
export function useMergedRefs<T = any>(
  ...refs: Array<Ref<T> | undefined>
): (instance: T | null) => void {
  return useCallback(
    (instance: T | null) => {
      refs.forEach(ref => {
        if (!ref) return;
        // This is a simplified version of [what React does][0] to set a ref.
        // [0]: https://github.com/facebook/react/blob/29b7b775f2ecf878eaf605be959d959030598b07/packages/react-reconciler/src/ReactFiberCommitWork.js#L661-L677
        if (typeof ref === "function") {
          ref(instance);
        } else if (typeof ref === "object" && ref !== null) {
          // I believe the types for `ref` are wrong in this case, as `ref.current` should
          //   not be `readonly`. That's why we do this cast. See [the React source][1].
          // [1]: https://github.com/facebook/react/blob/29b7b775f2ecf878eaf605be959d959030598b07/packages/shared/ReactTypes.js#L78-L80

          (ref as { current: T | null }).current = instance;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}

export default useMergedRefs;
