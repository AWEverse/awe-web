type TRFunc<T, R> = (arg: T) => R;

/**
 * @description
 * A pipe function that takes a list of functions and returns a new function that
 * takes an initial value and passes it through the list of functions.
 *
 * @param fns A list of functions to pipe
 * @returns A new function that takes an initial value and passes it through the list of functions
 */
export const pipe =
  <T>(...fns: TRFunc<any, any>[]) =>
  (x: T): ReturnType<(typeof fns)[number]> =>
    fns.reduce((v, f) => f(v), x);
