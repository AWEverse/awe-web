/**
 * A function type that takes an argument of any type and an effect, then returns any value.
 * @template E - The type of the effect.
 */
type AnyFunctionEffect<E> = (arg: any, effect: E) => any;

/**
 * Recursively computes the return type of the pipeWithEffect function by applying each function in the pipe to the result of the previous one.
 * @template T - The initial value type.
 * @template E - The effect type passed to each function.
 * @template F - The array of functions applied in the pipeline.
 */
type PipeWithEffectReturn<T, E, F extends AnyFunctionEffect<E>[]> = F extends [
  (arg: T, effect: E) => infer R,
  ...infer Rest,
]
  ? Rest extends AnyFunctionEffect<E>[]
    ? PipeWithEffectReturn<R, E, Rest>
    : R
  : T;

/**
 * Applies a sequence of functions to an initial value and an effect.
 * Each function takes two parameters: the result from the previous function and an effect.
 * @template E - The effect type passed to each function.
 * @template F - The array of functions applied in the pipeline.
 * @param fns - The list of functions to be applied sequentially.
 * @returns A function that takes an initial value and an effect, returning the final result after applying all functions.
 */
export const pipeWithEffect =
  <E, F extends AnyFunctionEffect<E>[]>(...fns: F) =>
  <T>(initialValue: T, effect: E): PipeWithEffectReturn<T, E, F> => {
    return fns.reduce(
      (result, fn) => fn(result, effect),
      initialValue,
    ) as PipeWithEffectReturn<T, E, F>;
  };

/**
 * Recursively computes the return type of the pipe function by applying each function in the pipe to the result of the previous one.
 * @template T - The initial value type.
 * @template F - The array of functions applied in the pipeline.
 */
type PipeReturn<T, F extends Array<(arg: any) => any>> = F extends [
  (arg: T) => infer R,
  ...infer Rest,
]
  ? Rest extends Array<(arg: any) => any>
    ? PipeReturn<R, Rest>
    : R
  : T;

/**
 * Applies a sequence of functions to an initial value.
 * Each function takes the result from the previous function and returns a new result.
 * @template F - The array of functions applied in the pipeline.
 * @param fns - The list of functions to be applied sequentially.
 * @returns A function that takes an initial value and returns the final result after applying all functions.
 */
export const pipe =
  <F extends Array<(arg: any) => any>>(...fns: F) =>
  <T>(initialValue: T): PipeReturn<T, F> => {
    return fns.reduce((result, fn) => fn(result), initialValue) as PipeReturn<
      T,
      F
    >;
  };
