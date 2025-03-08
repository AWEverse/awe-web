export type BitwiseState = number;
export type BitwiseFlag = number;

/**
 * Core bitwise operations for manipulating individual flags.
 */
export const BitwiseCore = {
  /**
   * Sets a specific flag in the state.
   * @param state - The current bitwise state
   * @param flag - The flag to set
   * @returns The updated state with the flag set
   * @example BitwiseCore.setFlag(0, 1) // Returns 1 (0b0001)
   */
  setFlag: (state: BitwiseState, flag: BitwiseFlag): BitwiseState => state | flag,

  /**
   * Unsets (clears) a specific flag in the state.
   * @param state - The current bitwise state
   * @param flag - The flag to unset
   * @returns The updated state with the flag cleared
   * @example BitwiseCore.unsetFlag(3, 2) // Returns 1 (0b0001)
   */
  unsetFlag: (state: BitwiseState, flag: BitwiseFlag): BitwiseState => state & ~flag,

  /**
   * Checks if a specific flag is set in the state.
   * @param state - The current bitwise state
   * @param flag - The flag to check
   * @returns True if the flag is set, false otherwise
   * @example BitwiseCore.hasFlag(3, 2) // Returns true
   */
  hasFlag: (state: BitwiseState, flag: BitwiseFlag): boolean => (state & flag) === flag,

  /**
   * Toggles a specific flag in the state (set if unset, unset if set).
   * @param state - The current bitwise state
   * @param flag - The flag to toggle
   * @returns The updated state with the flag toggled
   * @example BitwiseCore.toggleFlag(1, 2) // Returns 3 (0b0011)
   */
  toggleFlag: (state: BitwiseState, flag: BitwiseFlag): BitwiseState => state ^ flag,
};

/**
 * Bulk operations for manipulating multiple flags at once.
 */
export const BitwiseBulk = {
  /**
   * Sets multiple flags in the state.
   * @param state - The current bitwise state
   * @param flags - Array of flags to set
   * @returns The updated state with all specified flags set
   * @example BitwiseBulk.setMultiple(0, [1, 2]) // Returns 3 (0b0011)
   */
  setMultiple: (state: BitwiseState, flags: BitwiseFlag[]): BitwiseState =>
    flags.reduce(BitwiseCore.setFlag, state),

  /**
   * Unsets multiple flags in the state.
   * @param state - The current bitwise state
   * @param flags - Array of flags to unset
   * @returns The updated state with all specified flags cleared
   * @example BitwiseBulk.unsetMultiple(7, [2, 4]) // Returns 1 (0b0001)
   */
  unsetMultiple: (state: BitwiseState, flags: BitwiseFlag[]): BitwiseState =>
    flags.reduce(BitwiseCore.unsetFlag, state),

  /**
   * Toggles multiple flags in the state.
   * @param state - The current bitwise state
   * @param flags - Array of flags to toggle
   * @returns The updated state with all specified flags toggled
   * @example BitwiseBulk.toggleMultiple(1, [2, 4]) // Returns 7 (0b0111)
   */
  toggleMultiple: (state: BitwiseState, flags: BitwiseFlag[]): BitwiseState =>
    flags.reduce(BitwiseCore.toggleFlag, state),
};

/**
 * Query operations for inspecting the state.
 */
export const BitwiseQuery = {
  /**
   * Checks if any of the specified flags are set in the state.
   * @param state - The current bitwise state
   * @param flags - Array of flags to check
   * @returns True if at least one flag is set, false otherwise
   * @example BitwiseQuery.hasAny(3, [2, 4]) // Returns true
   */
  hasAny: (state: BitwiseState, flags: BitwiseFlag[]): boolean =>
    flags.some(flag => BitwiseCore.hasFlag(state, flag)),

  /**
   * Checks if all specified flags are set in the state.
   * @param state - The current bitwise state
   * @param flags - Array of flags to check
   * @returns True if all flags are set, false otherwise
   * @example BitwiseQuery.hasAll(3, [1, 2]) // Returns true
   */
  hasAll: (state: BitwiseState, flags: BitwiseFlag[]): boolean =>
    flags.every(flag => BitwiseCore.hasFlag(state, flag)),

  /**
   * Counts the number of set flags in the state.
   * @param state - The current bitwise state
   * @returns The number of set bits
   * @example BitwiseQuery.countFlags(7) // Returns 3
   */
  countFlags: (state: BitwiseState): number => {
    let count = 0;
    let n = state;
    while (n) {
      count += n & 1;
      n >>>= 1;
    }
    return count;
  },

  /**
   * Returns an array of flags that are currently set from a provided list.
   * @param state - The current bitwise state
   * @param allFlags - Array of all possible flags to check against
   * @returns Array of flags that are set in the state
   * @example BitwiseQuery.getEnabledFlags(5, [1, 2, 4, 8]) // Returns [1, 4]
   */
  getEnabledFlags: (state: BitwiseState, allFlags: BitwiseFlag[]): BitwiseFlag[] =>
    allFlags.filter(flag => BitwiseCore.hasFlag(state, flag)),
};

/**
 * Bit manipulation operations for advanced state transformations.
 */
export const BitwiseManipulation = {
  /**
   * Rotates bits to the left by a specified number of positions.
   * @param state - The current bitwise state
   * @param positions - Number of positions to rotate left
   * @returns The rotated state
   * @example BitwiseManipulation.rotateLeft(1, 1) // Returns 2 (0b0010)
   */
  rotateLeft: (state: BitwiseState, positions: number): BitwiseState => {
    const bits = 32;
    positions = positions % bits;
    return (state << positions) | (state >>> (bits - positions));
  },

  /**
   * Rotates bits to the right by a specified number of positions.
   * @param state - The current bitwise state
   * @param positions - Number of positions to rotate right
   * @returns The rotated state
   * @example BitwiseManipulation.rotateRight(2, 1) // Returns 1 (0b0001)
   */
  rotateRight: (state: BitwiseState, positions: number): BitwiseState => {
    const bits = 32;
    positions = positions % bits;
    return (state >>> positions) | (state << (bits - positions));
  },
};

/**
 * Mask operations for filtering and combining states.
 */
export const BitwiseMask = {
  /**
   * Creates a mask from an array of flags.
   * @param flags - Array of flags to include in the mask
   * @returns The combined mask
   * @example BitwiseMask.createMask([1, 4]) // Returns 5 (0b0101)
   */
  createMask: (flags: BitwiseFlag[]): BitwiseState =>
    flags.reduce(BitwiseCore.setFlag, 0),

  /**
   * Applies a mask to the state, keeping only masked bits.
   * @param state - The current bitwise state
   * @param mask - The mask to apply
   * @returns The masked state
   * @example BitwiseMask.applyMask(7, 5) // Returns 5 (0b0101)
   */
  applyMask: (state: BitwiseState, mask: BitwiseState): BitwiseState => state & mask,

  /**
   * Excludes bits specified by the mask from the state.
   * @param state - The current bitwise state
   * @param mask - The mask of bits to exclude
   * @returns The state with masked bits cleared
   * @example BitwiseMask.excludeMask(7, 2) // Returns 5 (0b0101)
   */
  excludeMask: (state: BitwiseState, mask: BitwiseState): BitwiseState => state & ~mask,
};

/**
 * Utility operations for state inspection and transformation.
 */
export const BitwiseUtility = {
  /**
   * Checks if the state has no flags set.
   * @param state - The current bitwise state
   * @returns True if state is 0, false otherwise
   * @example BitwiseUtility.isEmpty(0) // Returns true
   */
  isEmpty: (state: BitwiseState): boolean => state === 0,

  /**
   * Checks if all possible flags up to maxFlags are set.
   * @param state - The current bitwise state
   * @param maxFlags - The number of flags to check (bit width)
   * @returns True if all flags are set, false otherwise
   * @example BitwiseUtility.isFull(7, 3) // Returns true
   */
  isFull: (state: BitwiseState, maxFlags: number): boolean => state === (1 << maxFlags) - 1,

  /**
   * Inverts all bits in the state within a specified bit width.
   * @param state - The current bitwise state
   * @param maxBits - The bit width to invert within (default 32)
   * @returns The inverted state
   * @example BitwiseUtility.invert(1, 4) // Returns 14 (0b1110)
   */
  invert: (state: BitwiseState, maxBits: number = 32): BitwiseState =>
    ~state & ((1 << maxBits) - 1),
};

/**
 * Comparison operations for analyzing multiple states.
 */
export const BitwiseComparison = {
  /**
   * Checks if two states are equal.
   * @param state1 - First bitwise state
   * @param state2 - Second bitwise state
   * @returns True if states are equal, false otherwise
   * @example BitwiseComparison.equals(3, 3) // Returns true
   */
  equals: (state1: BitwiseState, state2: BitwiseState): boolean => state1 === state2,

  /**
   * Finds the differing bits between two states.
   * @param state1 - First bitwise state
   * @param state2 - Second bitwise state
   * @returns The XOR result showing differences
   * @example BitwiseComparison.difference(5, 3) // Returns 6 (0b0110)
   */
  difference: (state1: BitwiseState, state2: BitwiseState): BitwiseState => state1 ^ state2,

  /**
   * Finds the common bits between two states.
   * @param state1 - First bitwise state
   * @param state2 - Second bitwise state
   * @returns The AND result showing intersection
   * @example BitwiseComparison.intersection(5, 3) // Returns 1 (0b0001)
   */
  intersection: (state1: BitwiseState, state2: BitwiseState): BitwiseState => state1 & state2,

  /**
   * Combines two states into a single state.
   * @param state1 - First bitwise state
   * @param state2 - Second bitwise state
   * @returns The OR result showing union
   * @example BitwiseComparison.union(1, 2) // Returns 3 (0b0011)
   */
  union: (state1: BitwiseState, state2: BitwiseState): BitwiseState => state1 | state2,
};

/**
 * Debugging helpers for visualizing and analyzing states.
 */
export const BitwiseDebug = {
  /**
   * Converts the state to a binary string representation.
   * @param state - The current bitwise state
   * @param padLength - Minimum length of the string, padded with zeros (default 8)
   * @returns A binary string representation
   * @example BitwiseDebug.toBinaryString(5) // Returns "00000101"
   */
  toBinaryString: (state: BitwiseState, padLength: number = 8): string =>
    state.toString(2).padStart(padLength, '0'),

  /**
   * Converts the state to an array of individual flag values.
   * @param state - The current bitwise state
   * @returns Array of powers of 2 representing set flags
   * @example BitwiseDebug.toFlagArray(5) // Returns [1, 4]
   */
  toFlagArray: (state: BitwiseState): number[] => {
    const flags: number[] = [];
    let n = state;
    let position = 0;
    while (n) {
      if (n & 1) {
        flags.push(1 << position);
      }
      n >>>= 1;
      position++;
    }
    return flags;
  },
};

/**
 * Combined export of all bitwise utilities for convenience.
 */
export default {
  ...BitwiseCore,
  Bulk: BitwiseBulk,
  Query: BitwiseQuery,
  Manipulation: BitwiseManipulation,
  Mask: BitwiseMask,
  Utility: BitwiseUtility,
  Comparison: BitwiseComparison,
  Debug: BitwiseDebug,
};
