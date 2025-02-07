function curry<A, B, R>(fn: (a: A, b: B) => R): (a: A, b: B) => R;
function curry<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R;
function curry<A, B, R>(fn: (a: A, b: B) => R) {
  return function (...args: [A, B] | [A]): R | ((b: B) => R) {
    if (args.length === 2) {
      return fn(args[0], args[1]);
    } else {
      return (b: B) => fn(args[0], b);
    }
  };
}

const mapCurry = curry(<T, U>(fn: (value: T) => U, arr: T[]): U[] =>
  arr.map(fn),
);

export { curry, mapCurry };
