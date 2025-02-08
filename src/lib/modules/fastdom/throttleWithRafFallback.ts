import { throttleWith, fastRaf } from "@/lib/core";

const throttleWithRafFallback = <F extends AnyToVoidFunction>(callback: F) =>
  throttleWith(
    (throttledFn: NoneToVoidFunction) => fastRaf(throttledFn, true),
    callback,
  );

export default throttleWithRafFallback;
