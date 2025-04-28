import { throttleWith, fastRaf } from "@/lib/core";

function throttleWithRafFallback<F extends AnyToVoidFunction>(callback: F) {
  return throttleWith(
    (throttledFn: NoneToVoidFunction) => fastRaf(throttledFn, true),
    callback,
  );
}

export default throttleWithRafFallback;
