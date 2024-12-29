/**
 * A function type that takes an input and returns an output.
 */
type Func<TInput, TOutput> = (arg: TInput, effect?: any) => TOutput;

/**
 * Extracts the input type of the first function in a function pipe.
 * This type represents the initial value passed to the pipe.
 * If the pipe is empty, the input type is `never` or inferred properly based on the first function.
 */
export type PipeInput<T extends Func<any, any>[]> = T extends [Func<infer I, any>, ...any[]]
  ? I
  : unknown;

/**
 * Extracts the output type of the last function in a function pipe.
 */
export type PipeOutput<T extends Func<any, any>[]> = T extends [...any[], Func<infer I, any>]
  ? I
  : unknown;

/**
 * The resulting function type after applying the entire pipe.
 */
export type PipeResult<T extends Func<any, any>[]> = Func<PipeInput<T>, PipeOutput<T>>;

export type PipeWithEffect<T extends Func<any, any>[], E> = (
  input: PipeInput<T>,
  effect: E,
) => PipeOutput<T>;

/**
 * Pipe function that takes an array of functions and returns a function that applies them sequentially.
 * Supports functions that take an additional `effect` parameter.
 */
export const pipeWithEffect =
  <T extends Func<any, any>[], E>(...fns: T): PipeWithEffect<T, E> =>
  (initialValue: PipeInput<T>, effect: E) =>
    fns.reduce<any>((result, fn) => fn(result, effect), initialValue as PipeInput<T>);

/**
 * Regular pipe function that applies a series of functions to an initial value.
 */
export const pipe =
  <T extends Func<any, any>[]>(...fns: T): PipeResult<T> =>
  (initialValue: PipeInput<T>) =>
    fns.reduce<any>((result, fn) => fn(result), initialValue);
