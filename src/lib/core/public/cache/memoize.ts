import memoizee from "memoizee";
import { Ref, RefObject } from "react";

export function refMerger<T>(
  ...refs: Array<Ref<unknown>>
): (topLevelRef: T) => void {
  return (el: T) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as Mutable<RefObject<T>>).current = el;
      }
    });
  };
}

export function createRefMerger(): typeof refMerger {
  return memoizee(refMerger, { length: false, max: 1 });
}
