/**
 * Clamps a number between a minimum and maximum value using bitwise min/max.
 * @param num - Number to clamp.
 * @param min - Minimum value.
 * @param max - Maximum value.
 * @returns Clamped number.
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Number.isInteger(num) && Number.isInteger(min) && Number.isInteger(max)
    ? num < min
      ? min
      : num > max
        ? max
        : num
    : Math.min(Math.max(min, num), max);
};

/**
 * Clamps a number between 0 and 1, handling NaN.
 * @param x - Number to clamp.
 * @returns Clamped number between 0 and 1, or 0 if NaN.
 */
export const clamp01 = (x: number): number => {
  return Number.isNaN(x) ? 0 : clamp(x, 0, 1);
};

/**
 * Checks if a number is between min and max (inclusive) using bitwise comparisons.
 * @param num - Number to check.
 * @param min - Minimum bound.
 * @param max - Maximum bound.
 * @returns True if num is within [min, max], false otherwise.
 */
export const isBetween = (num: number, min: number, max: number): boolean => {
  return Number.isInteger(num) && Number.isInteger(min) && Number.isInteger(max)
    ? (num | 0) >= (min | 0) && (num | 0) <= (max | 0)
    : min <= num && num <= max;
};

/**
 * Rounds a number to a specified number of decimal places.
 * @param num - Number to round.
 * @param decimals - Decimal places (default: 0).
 * @returns Rounded number.
 */
export const round = (num: number, decimals: number = 0): number => {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
};

/**
 * Rounds a number with precision, correcting for floating-point errors.
 * @param num - Number to round.
 * @param decimals - Decimal places (default: 0).
 * @returns Rounded number.
 */
export const roundWithPrecision = (
  num: number,
  decimals: number = 0,
): number => {
  const precision = decimals | 0; // Bitwise floor
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
 * @param start - Start value.
 * @param end - End value.
 * @param t - Interpolation ratio (0 to 1).
 * @returns Interpolated value.
 */
export const lerp = (start: number, end: number, t: number): number => {
  return (1 - t) * start + t * end;
};

/**
 * Clamps linear interpolation between 0 and 1.
 * @param x - Interpolation ratio.
 * @returns Clamped interpolated value.
 */
export const lerp01 = (x: number): number => {
  return clamp(lerp(0, 1, x), 0, 1);
};

/**
 * Rounds a number to the nearest even integer using bitwise operations.
 * @param value - Number to round.
 * @returns Nearest even integer.
 */
export const roundToNearestEven = (value: number): number => {
  const rounded = value | 0;

  return (rounded & 1) === 0 ? rounded : rounded + (value > 0 ? 1 : -1);
};

/**
 * Rounds a number to the nearest odd integer using bitwise operations.
 * @param value - Number to round.
 * @returns Nearest odd integer.
 */
export const roundToNearestOdd = (value: number): number => {
  const rounded = value | 0;

  return (rounded & 1) === 1 ? rounded : rounded + (value > 0 ? 1 : -1);
};

/**
 * Squares a number.
 * @param x - Number to square.
 * @returns Squared value.
 */
export const square = (x: number): number => x * x;

/**
 * Calculates Euclidean distance in 2D or N-dimensional space.
 * @param args - Two numbers (x, y) for 2D or array of coordinates.
 * @returns Euclidean distance.
 */
export function distance(...args: number[]): number {
  return Math.hypot(...args);
}

/**
 * Converts radians to degrees.
 * @param x - Angle in radians.
 * @returns Angle in degrees.
 */
export const radToDeg = (x: number): number => (x * 180) / Math.PI;

/**
 * Converts degrees to radians.
 * @param x - Angle in degrees.
 * @returns Angle in radians.
 */
export const degToRad = (x: number): number => (x * Math.PI) / 180;

/**
 * Calculates the angle (in radians) between the X-axis and a point.
 * @param x - X-coordinate.
 * @param y - Y-coordinate.
 * @returns Angle in radians.
 */
export const angle = (x: number, y: number): number => Math.atan2(y, x);

/**
 * Calculates the angle (in degrees) between the X-axis and a point.
 * @param x - X-coordinate.
 * @param y - Y-coordinate.
 * @returns Angle in degrees.
 */
export const angleDeg = (x: number, y: number): number => radToDeg(angle(x, y));

/**
 * Alias for angle function (radians).
 * @param x - X-coordinate.
 * @param y - Y-coordinate.
 * @returns Angle in radians.
 */
export const angleRad = (x: number, y: number): number => angle(x, y);

/**
 * Returns the sign of a number using bitwise operations.
 * @param x - Number to evaluate.
 * @returns -1 (negative), 0 (zero), or 1 (positive).
 */
export const sign = (x: number): number => {
  return Number.isFinite(x)
    ? x === 0
      ? 0
      : ((x | 0) >> 31) | 1 // -1 for negative, 1 for positive
    : 0;
};

/**
 * Clamps an angle in radians to [-π, π] without modulo.
 * @param x - Angle in radians.
 * @returns Clamped angle.
 */
export const clampAngle = (x: number): number => {
  let angle = x;
  const twoPi = 2 * Math.PI;
  while (angle > Math.PI) angle -= twoPi;
  while (angle <= -Math.PI) angle += twoPi;
  return angle;
};

/**
 * Returns a random integer between min and max (inclusive) using bitwise operations.
 * @param min - Minimum value (default: 0).
 * @param max - Maximum value (default: 1).
 * @returns Random integer.
 */
export const randomInt = (min: number = 0, max: number = 1): number => {
  min = min | 0;
  max = max | 0;
  return min + ((Math.random() * (max - min + 1)) | 0);
};

/**
 * Returns a random boolean using bitwise comparison.
 * @returns Random true or false.
 */
export const randomBoolean = (): boolean => !!((Math.random() * 2) | 0); // 0 or 1, coerced to boolean

/**
 * Returns a random index from an array using bitwise operations.
 * @param array - Array to pick from.
 * @returns Random index.
 */
export const randomIndex = <T>(array: T[]): number => {
  return (Math.random() * array.length) | 0;
};

/**
 * Returns a random element from an array.
 * @param array - Array to pick from.
 * @returns Random element.
 */
export const randomElementFromArray = <T>(array: T[]): T =>
  array[randomIndex(array)];
