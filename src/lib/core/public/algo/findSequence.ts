import { areDeepEqual } from '@/lib/utils/areDeepEqual';

/**
 * Finds the first occurrence of a sequence of elements (`what`) within another sequence (`where`).
 * This implementation uses the Knuth-Morris-Pratt (KMP) algorithm for optimal performance.
 *
 * @param where The array to search within.
 * @param what The sequence (subarray) to search for.
 * @returns The starting index of the first occurrence of the "what" sequence in "where", or -1 if not found.
 */
export default function findSequence<T>(where: T[], what: T[]): number {
  const n = where.length;
  const m = what.length;

  if (m === 0) {
    return 0;
  }

  const lps = buildLps(what);

  let i = 0; // index for "where"
  let j = 0; // index for "what"

  while (i < n) {
    const isEqual = areDeepEqual(where[i], what[j]);

    if (isEqual) {
      i++;
      j++;
    }

    if (j === m) {
      return i - j;
    }

    if (i < n && !isEqual) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  return -1;
}

/**
 * Builds the Longest Prefix Suffix (LPS) array for the pattern.
 * This helps in skipping characters during mismatches in the KMP algorithm.
 *
 * @param pattern The array to build the LPS array for.
 * @returns The LPS array.
 */
function buildLps<T>(pattern: T[]): number[] {
  const lps: number[] = new Array(pattern.length).fill(0);
  let length = 0;
  let i = 1;

  while (i < pattern.length) {
    if (areDeepEqual(pattern[i], pattern[length])) {
      length++;
      lps[i] = length;
      i++;
    } else if (length > 0) {
      length = lps[length - 1];
    } else {
      lps[i] = 0;
      i++;
    }
  }

  return lps;
}
