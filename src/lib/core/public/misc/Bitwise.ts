export type BitwiseState = number;
export type BitwiseFlag = number;

/**
 * Core bitwise operations for manipulating individual flags.
 */
export const BitwiseCore = {
  setFlag: (state: BitwiseState, flag: BitwiseFlag): BitwiseState => {
    if (!Number.isInteger(flag) || flag < 0) throw new RangeError("Flag must be a non-negative integer");
    return state | flag;
  },

  unsetFlag: (state: BitwiseState, flag: BitwiseFlag): BitwiseState => {
    if (!Number.isInteger(flag) || flag < 0) throw new RangeError("Flag must be a non-negative integer");
    return state & ~flag;
  },

  hasFlag: (state: BitwiseState, flag: BitwiseFlag): boolean => {
    if (!Number.isInteger(flag) || flag < 0) throw new RangeError("Flag must be a non-negative integer");
    return (state & flag) === flag;
  },

  toggleFlag: (state: BitwiseState, flag: BitwiseFlag): BitwiseState => {
    if (!Number.isInteger(flag) || flag < 0) throw new RangeError("Flag must be a non-negative integer");
    return state ^ flag;
  },
};

/**
 * Bulk operations for manipulating multiple flags at once.
 */
export const BitwiseBulk = {
  setMultiple: (state: BitwiseState, flags: BitwiseFlag[]): BitwiseState => {
    if (!Array.isArray(flags)) throw new TypeError("Flags must be an array");
    return flags.reduce((acc, flag) => BitwiseCore.setFlag(acc, flag), state);
  },

  unsetMultiple: (state: BitwiseState, flags: BitwiseFlag[]): BitwiseState => {
    if (!Array.isArray(flags)) throw new TypeError("Flags must be an array");
    return flags.reduce((acc, flag) => BitwiseCore.unsetFlag(acc, flag), state);
  },

  toggleMultiple: (state: BitwiseState, flags: BitwiseFlag[]): BitwiseState => {
    if (!Array.isArray(flags)) throw new TypeError("Flags must be an array");
    return flags.reduce((acc, flag) => BitwiseCore.toggleFlag(acc, flag), state);
  },
};

/**
 * Query operations for inspecting the state.
 */
export const BitwiseQuery = {
  hasAny: (state: BitwiseState, flags: BitwiseFlag[]): boolean => {
    if (!Array.isArray(flags)) throw new TypeError("Flags must be an array");
    return (state & flags.reduce(BitwiseCore.setFlag, 0)) !== 0;
  },

  hasAll: (state: BitwiseState, flags: BitwiseFlag[]): boolean => {
    if (!Array.isArray(flags)) throw new TypeError("Flags must be an array");
    const mask = flags.reduce(BitwiseCore.setFlag, 0);
    return (state & mask) === mask;
  },

  countFlags: (state: BitwiseState): number => {
    let count = 0;
    let n = state >>> 0; // Приведение к unsigned integer
    while (n) {
      count += n & 1;
      n >>>= 1;
    }
    return count;
  },

  getEnabledFlags: (state: BitwiseState, allFlags: BitwiseFlag[]): BitwiseFlag[] => {
    if (!Array.isArray(allFlags)) throw new TypeError("allFlags must be an array");
    return allFlags.filter(flag => BitwiseCore.hasFlag(state, flag));
  },
};

/**
 * Mask operations for filtering and combining states.
 */
export const BitwiseMask = {
  createMask: (flags: BitwiseFlag[]): BitwiseState => {
    if (!Array.isArray(flags)) throw new TypeError("Flags must be an array");
    return flags.reduce(BitwiseCore.setFlag, 0);
  },

  applyMask: (state: BitwiseState, mask: BitwiseState): BitwiseState => state & mask,

  excludeMask: (state: BitwiseState, mask: BitwiseState): BitwiseState => state & ~mask,
};

/**
 * Utility operations for state inspection and transformation.
 */
export const BitwiseUtility = {
  isEmpty: (state: BitwiseState): boolean => (state >>> 0) === 0,

  isFull: (state: BitwiseState, maxFlags: number): boolean => {
    if (!Number.isInteger(maxFlags) || maxFlags < 0) throw new RangeError("maxFlags must be a non-negative integer");
    return (state >>> 0) === (1 << maxFlags) - 1;
  },

  invert: (state: BitwiseState, maxBits: number = 32): BitwiseState => {
    if (!Number.isInteger(maxBits) || maxBits <= 0) throw new RangeError("maxBits must be a positive integer");
    return (~state >>> 0) & ((1 << maxBits) - 1);
  },
};

/**
 * Comparison operations for analyzing multiple states.
 */
export const BitwiseComparison = {
  equals: (state1: BitwiseState, state2: BitwiseState): boolean => (state1 >>> 0) === (state2 >>> 0),

  difference: (state1: BitwiseState, state2: BitwiseState): BitwiseState => state1 ^ state2,

  intersection: (state1: BitwiseState, state2: BitwiseState): BitwiseState => state1 & state2,

  union: (state1: BitwiseState, state2: BitwiseState): BitwiseState => state1 | state2,
};

/**
 * Debugging helpers for visualizing states.
 */
export const BitwiseDebug = {
  toBinaryString: (state: BitwiseState, padLength: number = 8): string => {
    if (!Number.isInteger(padLength) || padLength < 0) throw new RangeError("padLength must be a non-negative integer");
    return (state >>> 0).toString(2).padStart(padLength, "0");
  },

  toFlagArray: (state: BitwiseState): number[] => {
    const flags: number[] = [];
    let n = state >>> 0;
    let position = 0;
    while (n) {
      if (n & 1) flags.push(1 << position);
      n >>>= 1;
      position++;
    }
    return flags;
  },
};

/**
 * Combined export of all bitwise utilities.
 */
export default {
  ...BitwiseCore,
  Bulk: BitwiseBulk,
  Query: BitwiseQuery,
  Mask: BitwiseMask,
  Utility: BitwiseUtility,
  Comparison: BitwiseComparison,
  Debug: BitwiseDebug,
};
