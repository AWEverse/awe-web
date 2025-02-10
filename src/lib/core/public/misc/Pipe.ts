type AnyArray = AnyFunction[];

/**
 * Recursively computes the return type of the pipe function by applying each function in the pipeline to the result of the previous one.
 * @template T - The type of the initial value.
 * @template F - A tuple of functions applied in the pipeline.
 */
export type PipeReturn<T, F extends AnyArray> = F extends [
  (arg: T) => infer R,
  ...infer Rest,
]
  ? Rest extends AnyArray
    ? PipeReturn<R, Rest>
    : R
  : T;

/**
 * Applies a sequence of functions to an initial value.
 * Each function takes the result from the previous one and returns a new result.
 */
export function pipe<T>(): (value: T) => T;
export function pipe<T, F extends [(arg: T) => any, ...AnyArray]>(
  ...fns: F
): (value: T) => PipeReturn<T, F>;
export function pipe<T>(...fns: AnyArray) {
  return (initialValue: T) =>
    fns.reduce((result, fn) => fn(result), initialValue);
}
