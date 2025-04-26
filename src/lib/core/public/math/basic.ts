/**
 * Computes the numerical derivative of a function at a point using central difference.
 * Optimized for JavaScript's floating-point arithmetic and browser performance.
 *
 * @param fn - Function to differentiate, mapping x to f(x).
 * @param x - Point at which to compute the derivative.
 * @param h - Step size for numerical differentiation (default: 1e-5, tuned for precision).
 * @returns Approximate derivative at x.
 */
export const derivative = (
  fn: (x: number) => number,
  x: number,
  h: number = 1e-5,
): number => {
  if (!Number.isFinite(x) || !Number.isFinite(h) || h <= 0) return NaN;

  // (f(x + h) - f(x - h)) / (2h)
  const fPlus = fn(x + h);
  const fMinus = fn(x - h);

  if (!Number.isFinite(fPlus) || !Number.isFinite(fMinus)) return NaN;

  return (fPlus - fMinus) / (2 * h);
};

/**
 * Computes the numerical integral of a function using Simpson's 1/3 rule.
 * Optimized for browser performance and numerical stability in JavaScript.
 *
 * @param fn - Function to integrate, mapping x to f(x).
 * @param a - Lower bound of integration interval.
 * @param b - Upper bound of integration interval.
 * @param n - Number of subintervals (default: 1000, must be even).
 * @returns Approximate integral value from a to b.
 */
export const integrate = (
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number = 1000,
): number => {
  // Validate inputs
  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    n <= 0 ||
    !Number.isInteger(n)
  )
    return NaN;
  if (n % 2 !== 0) n += 1;

  const h = (b - a) / n;
  let sum = fn(a) + fn(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += fn(x) * (4 >> (i & 1)); // Bitwise replacement for (i % 2 === 0 ? 2 : 4)
  }

  const result = (h / 3) * sum;
  return Number.isFinite(result) ? result : NaN;
};

/**
 * Computes the factorial of a non-negative integer using an iterative approach.
 * Optimized for JavaScript's number precision and browser performance.
 *
 * @param n - Non-negative integer to compute factorial for.
 * @returns Factorial of n, or NaN for invalid inputs.
 */
export const factorial = (n: number): number => {
  // Validate input
  if (!Number.isInteger(n) || n < 0 || n > 170) return NaN; // 170! exceeds JavaScript's safe number range

  if (n <= 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

/**
 * Computes the arithmetic mean of an array of numbers using a single-pass algorithm.
 *
 * @param numbers - Array of numbers to average.
 * @returns The mean of the numbers, or 0 if the array is empty.
 */
export const average = (numbers: number[]): number => {
  const len = numbers.length;
  if (len === 0) return 0;

  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += numbers[i];
  }
  return sum / len;
};
/**
 * Calculates the median of an array of numbers.
 *
 * @param {number[]} numbers - The array of numbers.
 * @returns {number} The median of the numbers.
 */
export const median = (numbers: number[]): number => {
  if (!numbers.length) {
    return -1;
  }

  const swap = <T>(arr: T[], i: number, j: number): void => {
    if (i !== j && arr[i] !== undefined && arr[j] !== undefined) {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  };

  const partition = (
    arr: number[],
    left: number,
    right: number,
    pivotIndex: number,
  ): number => {
    let storeIndex = left;
    const pivotValue = arr[pivotIndex];

    swap(arr, pivotIndex, right);

    for (let i = left; i < right; i++) {
      if (arr[i] < pivotValue) {
        swap(arr, i, storeIndex);
        storeIndex++;
      }
    }

    swap(arr, right, storeIndex);

    return storeIndex;
  };

  const quickSelect = (
    arr: number[],
    left: number,
    right: number,
    k: number,
  ): number => {
    if (left === right) {
      return arr[left];
    }

    // Выбираем случайный pivot
    const pivotIndex = Math.floor(Math.random() * (right - left + 1)) + left;
    const pivotNewIndex = partition(arr, left, right, pivotIndex);

    if (k === pivotNewIndex) {
      return arr[k];
    } else if (k < pivotNewIndex) {
      const right = pivotNewIndex - 1;
      return quickSelect(arr, left, right, k);
    } else {
      const left = pivotNewIndex + 1;
      return quickSelect(arr, left, right, k);
    }
  };

  const n = numbers.length;

  if (n % 2 === 1) {
    return quickSelect(numbers, 0, n - 1, Math.floor(n / 2));
  } else {
    const left = 0;
    const right = n - 1;

    const kLeft = Math.floor(n / 2) - 1;
    const kRight = Math.floor(n / 2);

    const leftMedian = quickSelect(numbers, left, right, kLeft);
    const rightMedian = quickSelect(numbers, left, right, kRight);

    return (leftMedian + rightMedian) / 2;
  }
};

/**
 * Computes the greatest common divisor (GCD) of two numbers using bitwise operations (binary GCD algorithm).
 * This implementation is more efficient than the standard Euclidean algorithm for large numbers.
 *
 * @param {number} a - The first number (must be a non-negative integer).
 * @param {number} b - The second number (must be a non-negative integer).
 * @returns {number} The GCD of a and b.
 */
export const gcd = (a: number, b: number): number => {
  // Base cases: gcd(n, 0) = gcd(0, n) = n
  if (a === 0) return b;
  if (b === 0) return a;

  const aZeros = Math.clz32(a) - Math.clz32(a & -a);
  const bZeros = Math.clz32(b) - Math.clz32(b & -b);
  const k = Math.min(aZeros, bZeros);

  a >>= aZeros;
  b >>= bZeros;

  while (a !== b) {
    if (a > b) {
      a -= b;
      a >>= Math.clz32(a) - Math.clz32(a & -a);
    } else {
      b -= a;
      b >>= Math.clz32(b) - Math.clz32(b & -b);
    }
  }

  return a << k;
};

/**
 * Returns the least common multiple (LCM) of two numbers.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The LCM of a and b.
 */
export const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b);
};

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in radians.
 */
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Converts radians to degrees.
 *
 * @param {number} radians - The angle in radians.
 * @returns {number} The angle in degrees.
 */
export const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};
