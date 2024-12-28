type Func<T> = (x: T) => T;

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
 * const multiplyByTwo = (x: number) => x * 2;
 * const addOneAndMultiplyByTwo = pipe(addOne, multiplyByTwo);
 *
 * console.log(addOneAndMultiplyByTwo(2)); // 6
 * ```
 */
const pipe =
  <T>(...fns: Array<Func<T>>) =>
  (x: T): T =>
    fns.reduce((v, f) => f(v), x);
