/**
 * Clamps a number between a minimum and a maximum value.
 * If `inclusive` is true, `num` will be clamped inclusively.
 * If `inclusive` is false, the clamped result will be within (min, max).
 *
 * @param num - The number to clamp.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns The clamped number.
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(min, num), max);
};

/**
 * Clamps a number between 0 and 1.
 * If `x` is not a number, it returns 0.
 *
 * @param x - The number to clamp.
 * @returns The clamped number between 0 and 1.
 */
export const clamp01 = (x: number): number => {
  if (isNaN(x)) return 0;
  return clamp(x, 0, 1);
};

/**
 * Checks if a number is between a minimum and maximum value.
 * Allows specifying whether the min and max bounds are inclusive.
 *
 * @param num - The number to check.
 * @param min - The minimum bound.
 * @param max - The maximum bound.
 * @returns True if `num` is within the range, false otherwise.
 */
export const isBetween = (num: number, min: number, max: number): boolean => {
  return min <= num && num <= max;
};

/**
 * Rounds a number to a specific number of decimal places.
 *
 * @param num - The number to round.
 * @param decimals - The number of decimal places to round to (default is 0).
 * @returns The rounded number.
 */
export const round = (num: number, decimals: number = 0): number => {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
};

export const roundWithPrecision = (
  num: number,
  decimals: number = 0,
): number => {
  const precision = Math.floor(decimals);
  if (precision === 0) return Math.round(num);

  const factor = 10 ** precision;
  const scaled = num * factor;
  const correction = Number(
    (Math.sign(num) * Number.EPSILON).toFixed(Math.max(0, precision)),
  );

  return Math.round(scaled + correction) / factor;
};

/**
 * Performs linear interpolation between two numbers.
 *
 * @param start - The starting value.
 * @param end - The ending value.
 * @param interpolationRatio - A ratio between 0 and 1 indicating the interpolation progress.
 * @returns The interpolated value.
 */
export const lerp = (
  start: number,
  end: number,
  interpolationRatio: number,
): number => {
  return (1 - interpolationRatio) * start + interpolationRatio * end;
};

/**
 * Clamps the linear interpolation result between 0 and 1.
 *
 * @param x - The interpolation ratio.
 * @returns The clamped interpolated value between 0 and 1.
 */
export const lerp01 = (x: number): number => {
  return clamp(lerp(0, 1, x), 0, 1);
};

/**
 * Rounds a number to the nearest even integer.
 *
 * @param value - The number to round.
 * @returns The nearest even integer.
 */
export const roundToNearestEven = (value: number): number => {
  return value % 2 === 0 ? value : value + (value > 0 ? 1 : -1);
};

/**
 * Rounds a number to the nearest odd integer.
 *
 * @param value - The number to round.
 * @returns The nearest odd integer.
 */
export const roundToNearestOdd = (value: number): number => {
  return value % 2 !== 0 ? value : value + (value > 0 ? 1 : -1);
};

/**
 * Squares a number.
 *
 * @param x - The number to square.
 * @returns The squared value.
 */
export const square = (x: number): number => x * x;

/**
 * Calculates the distance between coordinates in 2D or N-dimensional space.
 *
 * @param x - The x-coordinate (for 2D distance calculation).
 * @param y - The y-coordinate (for 2D distance calculation).
 * @returns The Euclidean distance between the two points.
 */
export function distance(x: number, y: number): number;

/**
 * Implementation of the distance function with support for 2D and N-dimensional space.
 *
 * @param args - Either two parameters (x, y) for 2D or a list of coordinate values.
 * @returns The Euclidean distance.
 */
export function distance(...args: number[]): number {
  if (args.length === 2) {
    const [x, y] = args;

    return Math.hypot(x, y);
  }

  return Math.hypot(...args);
}

/**
 * Converts radians to degrees.
 *
 * @param x - The angle in radians.
 * @returns The angle in degrees.
 */
export const radToDeg = (x: number): number => (x * 180) / Math.PI;

/**
 * Converts degrees to radians.
 *
 * @param x - The angle in degrees.
 * @returns The angle in radians.
 */
export const degToRad = (x: number): number => (x * Math.PI) / 180;

/**
 * Calculates the angle (in radians) between the positive X-axis and a point.
 *
 * @param x - The x-coordinate of the point.
 * @param y - The y-coordinate of the point.
 * @returns The angle in radians.
 */
export const angle = (x: number, y: number): number => Math.atan2(y, x);

/**
 * Calculates the angle (in degrees) between the positive X-axis and a point.
 *
 * @param x - The x-coordinate of the point.
 * @param y - The y-coordinate of the point.
 * @returns The angle in degrees.
 */
export const angleDeg = (x: number, y: number): number => {
  return radToDeg(angle(x, y));
};

/**
 * Calculates the angle (in radians) between the positive X-axis and a point.
 *
 * @param x - The x-coordinate of the point.
 * @param y - The y-coordinate of the point.
 * @returns The angle in radians.
 */
export const angleRad = (x: number, y: number): number => {
  return angle(x, y);
};

/**
 * Returns the sign of a number (-1, 0, or 1).
 *
 * @param x - The number to get the sign of.
 * @returns -1 if `x` is negative, 0 if `x` is zero, 1 if `x` is positive.
 */
export const sign = (x: number): number => {
  if (Math.abs(x) < Number.EPSILON) {
    return 0;
  }

  return x > 0 ? 1 : -1;
};

/**
 * Clamps an angle in radians to the range [-π, π].
 *
 * @param x - The angle in radians.
 * @returns The clamped angle.
 */
export const clampAngle = (x: number): number => {
  const normalizedAngle = x % (2 * Math.PI);

  if (normalizedAngle > Math.PI) {
    return normalizedAngle - 2 * Math.PI;
  }

  return normalizedAngle;
};

/**
 * Returns a random integer between `min` and `max` (inclusive).
 *
 * @param min - The minimum value (default is 0).
 * @param max - The maximum value (default is 1).
 * @returns A random integer between `min` and `max`.
 */
export const randomInt = (min: number = 0, max: number = 1): number =>
  min + Math.floor(Math.random() * (max - min + 1));

/**
 * Returns a random boolean value (true or false).
 *
 * @returns A random boolean.
 */
export const randomBoolean = (): boolean => Math.random() > 0.5;

/**
 * Returns a random index from an array.
 *
 * @param array - The array to pick an index from.
 * @returns A random index from the array.
 */
export const randomIndex = <T>(array: T[]): number =>
  Math.floor(Math.random() * array.length);

/**
 * Returns a random element from an array.
 *
 * @param array - The array to pick an element from.
 * @returns A random element from the array.
 */
export const randomElementFromArray = <T>(array: T[]): T =>
  array[randomIndex(array)];
