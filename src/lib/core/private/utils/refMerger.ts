interface MutableRefObject<T> {
  current: T;
}

type RefCallback<T> = (element: T) => void;
type RefType<T> = MutableRefObject<T> | RefCallback<T> | null | undefined;
type RefHandler<T> = (element: T) => void;

/**
 * Checks if a ref is a MutableRefObject.
 */
export const isMutableRef = <T>(ref: unknown): ref is MutableRefObject<T> =>
  ref != null && typeof ref === "object" && "current" in ref;

/**
 * Merges multiple React refs into a single handler function.
 * Supports both MutableRefObject and callback refs.
 * @param refs Array of refs to merge
 * @returns A handler function that applies the element to all valid refs
 */
export function refMerger<T>(...refs: RefType<T>[]): RefHandler<T> {
  const validRefs = refs.filter((ref): ref is MutableRefObject<T> | RefCallback<T> => ref != null);

  // No valid refs: return no-op
  if (validRefs.length === 0) {
    return () => { };
  }

  // Single ref: optimize by returning direct handler
  if (validRefs.length === 1) {
    const ref = validRefs[0];

    return isMutableRef<T>(ref)
      ? (element: T) => {
        ref.current = element;
      }
      : ref;
  }

  // Multiple refs: create merged handler
  return (element: T) => {
    for (const ref of validRefs) {
      if (isMutableRef<T>(ref)) {
        ref.current = element;
      } else {
        ref(element);
      }
    }
  };
}
