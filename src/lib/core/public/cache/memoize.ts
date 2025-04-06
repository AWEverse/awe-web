import memoizee from "memoizee";
import { Ref, RefCallback } from "react";

interface MutableRefObject<T> {
  current: T;
}

type RefType<T> = Ref<T> | null | undefined;
type RefHandler<T> = (element: T) => void;

const isMutableRef = <T>(ref: unknown): ref is MutableRefObject<T> =>
  ref != null && Object.prototype.hasOwnProperty.call(ref, "current");

export function refMerger<T>(...refs: Array<RefType<T>>): RefHandler<T> {
  const validRefs = refs.filter(Boolean) as Array<
    MutableRefObject<T> | RefCallback<T>
  >;

  if (validRefs.length === 0) {
    return () => { };
  }

  if (validRefs.length === 1) {
    const singleRef = validRefs[0];

    return isMutableRef<T>(singleRef)
      ? (el: T) => {
        singleRef.current = el;
      }
      : singleRef;
  }

  const handler: RefHandler<T> = (element) => {
    for (const ref of validRefs) {
      if (isMutableRef<T>(ref)) {
        ref.current = element;
      } else {
        ref(element);
      }
    }
  };

  return handler;
}

export function createRefMerger(): typeof refMerger {
  return memoizee(refMerger, {
    length: false, // Allow variable number of arguments
    max: 100, // Increased cache size for common ref combinations
    primitive: true, // Optimize for primitive arguments

  });
}

export function createComposableRefMerger<T>(): {
  merge: (...refs: Array<RefType<T>>) => RefHandler<T>;
  cleanup: () => void;
} {
  const refCache = new WeakMap<object, RefHandler<T>>();

  const merge = (...refs: Array<RefType<T>>) => {
    const key = refs as unknown as object;

    if (refCache.has(key)) {
      return refCache.get(key)!;
    }

    const handler = refMerger(...refs);
    refCache.set(key, handler);
    return handler;
  };

  const cleanup = () => {
    refCache.delete(refCache);
  };

  return { merge, cleanup };
}
