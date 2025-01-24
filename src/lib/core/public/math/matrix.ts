type Matrix2x2 = [[number, number], [number, number]];
type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

/**
 * Multiplies two 2x2 matrices.
 *
 * @param a - The first 2x2 matrix.
 * @param b - The second 2x2 matrix.
 * @returns The resulting 2x2 matrix after multiplication.
 */
export const multiplyMatrix2x2 = (a: Matrix2x2, b: Matrix2x2): Matrix2x2 => {
  const result: Matrix2x2 = [
    [0, 0],
    [0, 0],
  ];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      result[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j];
    }
  }

  return result;
};

/**
 * Multiplies a 2x2 matrix by a scalar.
 *
 * @param a - The 2x2 matrix.
 * @param scalar - The scalar to multiply the matrix by.
 * @returns The resulting 2x2 matrix after scalar multiplication.
 */
export const multiplyMatrix2x2ByScalar = (
  a: Matrix2x2,
  scalar: number,
): Matrix2x2 => {
  return multiplyMatrix2x2(a, [
    [scalar, 0],
    [0, scalar],
  ]);
};

/**
 * Multiplies two 3x3 matrices.
 *
 * @param a - The first 3x3 matrix.
 * @param b - The second 3x3 matrix.
 * @returns The resulting 3x3 matrix after multiplication.
 */
export const multiplyMatrix3x3 = (a: Matrix3x3, b: Matrix3x3): Matrix3x3 => {
  const result: Matrix3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
    }
  }

  return result;
};

/**
 * Multiplies a 3x3 matrix by a scalar.
 *
 * @param a - The 3x3 matrix.
 * @param scalar - The scalar to multiply the matrix by.
 * @returns The resulting 3x3 matrix after scalar multiplication.
 */
export const multiplyMatrix3x3ByScalar = (
  a: Matrix3x3,
  scalar: number,
): Matrix3x3 => {
  return multiplyMatrix3x3(a, [
    [scalar, 0, 0],
    [0, scalar, 0],
    [0, 0, scalar],
  ]);
};
