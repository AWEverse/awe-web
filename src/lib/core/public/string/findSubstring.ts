function areDeepEqual(str1: string, str2: string): boolean {
  return str1 === str2;
}

/**
 * Finds the first occurrence of a substring (`pattern`) within another string (`text`).
 * This implementation uses the Turbo-Boyer-Moore algorithm for optimal performance.
 *
 * @param text The string to search within.
 * @param pattern The substring to search for.
 * @returns The starting index of the first occurrence of the "pattern" substring in "text", or -1 if not found.
 */
const findSubstring = (text: string, pattern: string): number => {
  const n = text.length;
  const m = pattern.length;

  if (m === 0) return 0; // If the pattern is empty, return 0

  const badCharShift = buildBadCharShift(pattern);
  const suffixShift = buildSuffixShift(pattern);

  let i = 0; // Index for text
  let j = 0; // Index for pattern

  while (i <= n - m) {
    j = m - 1;

    // Move j to match pattern in text starting from the end of pattern
    while (j >= 0 && areDeepEqual(text[i + j], pattern[j])) {
      j--;
    }

    // If the pattern matches, return the starting index
    if (j < 0) {
      return i;
    } else {
      // Use the max shift based on the bad character shift or suffix shift
      const badChar = text[i + j];
      const shift = Math.max(badCharShift[badChar] || m, suffixShift[j]);
      i += shift;
    }
  }

  return -1; // Pattern not found
};

// Build the bad character shift table for pattern
function buildBadCharShift(pattern: string): Record<string, number> {
  const shift: Record<string, number> = {};
  const m = pattern.length;

  // Populate bad character shift table
  for (let i = 0; i < m - 1; i++) {
    shift[pattern[i]] = m - i - 1; // The shift is the distance from the end of the pattern
  }

  return shift;
}

// Build the suffix shift table for pattern
function buildSuffixShift(pattern: string): number[] {
  const m = pattern.length;
  const shift = new Array(m).fill(m);

  // Populate suffix shift table
  for (let i = m - 2; i >= 0; i--) {
    let j = i;
    while (j >= 0 && areDeepEqual(pattern[j], pattern[m - 1 - (i - j)])) {
      j--;
    }
    shift[i] = m - 1 - j;
  }

  return shift;
}

export default findSubstring;
