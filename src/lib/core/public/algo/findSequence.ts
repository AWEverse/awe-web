/**
 * Finds the first occurrence of a sequence of elements (`What`) within another sequence (`Where`).
 *
 * @param where The array to search within.
 * @param what The sequence (subarray) to search for.
 * @returns The starting index of the first occurrence of the "what" sequence in "where", or -1 if not found.
 */
export default function findSequence<T>(where: T[], what: T[]): number {
  if (what.length > where.length) {
    return -1; // Return -1 if "what" is larger than "where"
  }

  for (let i = 0; i <= where.length - what.length; i++) {
    let match = true;

    for (let j = 0; j < what.length; j++) {
      if (where[i + j] !== what[j]) {
        match = false;
        break;
      }
    }

    if (match) {
      return i; // Return the starting index of the first match
    }
  }
  return -1; // Return -1 if no match is found
}
