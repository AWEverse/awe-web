/**
 * Asserts an expression is true.
 *
 * @param value - An expression to assert is true.
 * @param message - An optional message for the assertion error thrown.
 */
export function strictAssert(value: boolean | undefined, message: string): asserts value {
  if (!Boolean(value)) {
    throw new Error(message);
  }
}
