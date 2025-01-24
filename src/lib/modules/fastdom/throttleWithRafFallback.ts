import { throttleWith, fastRaf } from "@/lib/core";

const throttleWithRafFallback = <F extends AnyToVoidFunction>(fn: F) =>
  throttleWith(
    (throttledFn: NoneToVoidFunction) => fastRaf(throttledFn, true),
    fn,
  );

export default throttleWithRafFallback;
