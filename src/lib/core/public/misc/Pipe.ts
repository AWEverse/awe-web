type Func<TInput, TOutput> = (arg: TInput) => TOutput;

/**
 * Extract the input type of the first function in the pipe.
 */
type PipeInput<T extends Func<any, any>[]> = T extends [infer F, ...any[]]
  ? F extends Func<infer I, any>
    ? I
    : never
  : never;

/**
 * Extract the output type of the last function in the pipe.
 */
type PipeOutput<T extends Func<any, any>[]> = T extends [...any[], infer L]
  ? L extends Func<any, infer O>
    ? O
    : never
  : never;

/**
 * The resulting function type after applying the pipe.
 */
type PipeResult<T extends Func<any, any>[]> = Func<PipeInput<T>, PipeOutput<T>>;

/**
 * @description
 * A pipe function that takes a list of functions and returns a new function that
 * takes an initial value and passes it through the list of functions.
 *
 * @param fns - A list of functions to pipe
 * @returns A new function that takes an initial value and passes it through the list of functions
 *
 * @example
 * ```typescript
 * const addOne = (x: number) => x + 1;
 * const toString = (x: number) => x.toString();
 * const addOneAndToString = pipe(addOne, toString);
 *
 * console.log(addOneAndToString(2)); // "3"
 * ```
 */
export default function pipe<T extends Func<any, any>[]>(...fns: T): PipeResult<T> {
  return (initialValue: PipeInput<T>) => fns.reduce<any>((result, fn) => fn(result), initialValue);
}
