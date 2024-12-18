import { throttleWith, fastRaf } from '@/lib/utils/schedulers';

export default function <F extends AnyToVoidFunction>(fn: F) {
  return throttleWith((throttledFn: NoneToVoidFunction) => fastRaf(throttledFn, true), fn);
}
