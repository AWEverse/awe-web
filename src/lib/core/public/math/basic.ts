type MathFunction = (x: number) => number;
/**
 * Calculates the numerical derivative of a given function at a specific point using central difference.
 *
 * @param {function} f - The function whose derivative needs to be computed.
 * @param {number} x - The point at which to compute the derivative.
 * @param {number} [h=1e-5] - The step size used for numerical differentiation (default is 1e-5).
 * @returns {number} The approximate value of the derivative at the point x.
 */
export const derivative = (fn: MathFunction, x: number, h: number = 1e-5): number => {
  return (fn(x + h) - fn(x)) / h;
};

/**
 * Calculates the numerical integral of a function using the trapezoidal rule.
 *
 * @param {function} f - The function to integrate.
 * @param {number} a - The start of the interval over which to integrate.
 * @param {number} b - The end of the interval over which to integrate.
 * @param {number} [n=1000] - The number of trapezoids to use in the approximation (default is 1000).
 * @returns {number} The approximate value of the integral.
 */
export const integrate = (
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 1000,
): number => {
  const h = (b - a) / n;
  let sum = 0;

  for (let i = 0; i < n; i += 2) {
    const x1 = a + i * h;
    const x2 = a + (i + 1) * h;
    const x3 = a + (i + 2) * h;

    sum += f(x1) + 4 * f(x2) + f(x3);
  }

  return (h / 3) * sum;
};

/**
 * Calculates the factorial of a given number using an iterative approach.
 *
 * @param {number} n - The number to compute the factorial for.
 * @returns {number} The factorial of the number n.
 */
export const factorial = (n: number): number => {
  if (n < 0) {
    return NaN;
  }

  let result = 1;

  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
};

/**
 * Calculates the average (mean) of an array of numbers.
 *
 * @param {number[]} numbers - The array of numbers.
 * @returns {number} The mean of the numbers.
 */
export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return NaN;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
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

  const partition = (arr: number[], left: number, right: number, pivotIndex: number): number => {
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

  const quickSelect = (arr: number[], left: number, right: number, k: number): number => {
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
 * Returns the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The GCD of a and b.
 */
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
