/**
 * Recursively computes the return type of the pipe function by applying each function in the pipeline.
 * @template T - The type of the value being passed through the pipeline
 * @template Fns - Tuple of functions in the pipeline
 */
export type PipeReturn<
  T,
  Fns extends ReadonlyArray<AnyFunction>,
> = Fns extends []
  ? T
  : Fns extends [(arg: T) => infer R, ...infer Rest]
  ? Rest extends ReadonlyArray<AnyFunction>
  ? PipeReturn<R, Rest>
  : never
  : never;

/**
 * Creates a pipeline of functions, where each function takes the output of the previous function.
 * @returns A function that accepts an initial value and applies the pipeline of functions to it
 */
export function pipe(): <T>(value: T) => T;

/**
 * Creates a pipeline of functions, where each function takes the output of the previous function.
 * @param fns - Functions to be applied in sequence
 * @returns A function that accepts an initial value and applies the pipeline of functions to it
 */
export function pipe<T, Fns extends ReadonlyArray<AnyFunction>>(
  ...fns: Fns & { 0: (arg: T) => any }
): (value: T) => PipeReturn<T, Fns>;

export function pipe<T>(...fns: ReadonlyArray<AnyFunction>) {
  return (initialValue: T): unknown =>
    fns.reduce((result, fn) => fn(result), initialValue);
}
