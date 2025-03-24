import SignalsConfig from "./SignalsConfig";

// Set up ability to configure globally
export function configureSignals(config: Partial<typeof SignalsConfig>): void {
  Object.assign(SignalsConfig, config);
}

// Equality functions
export const defaultEquals = <T>(a: T, b: T): boolean => a === b;

/**
 * Improved deep equality function with better type safety and performance
 */
export const deepEquals = <T>(a: T, b: T): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEquals(item, b[index]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key =>
    Object.prototype.hasOwnProperty.call(b, key) &&
    deepEquals((a as any)[key], (b as any)[key])
  );
};

