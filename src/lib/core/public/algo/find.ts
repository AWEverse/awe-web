// Enum to handle case sensitivity
export enum ESearchCase {
  CaseSensitive = 'CaseSensitive',
  IgnoreCase = 'IgnoreCase',
}

function processString(
  view: string,
  search: string,
  searchCase: ESearchCase,
): { processedView: string; processedSearch: string } {
  if (searchCase === ESearchCase.IgnoreCase) {
    return {
      processedView: view.toLowerCase(),
      processedSearch: search.toLowerCase(),
    };
  }
  return { processedView: view, processedSearch: search };
}

/**
 * Finds the first occurrence of a search string within a given view string.
 *
 * @param view - The string to search within.
 * @param search - The string to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @returns The index of the first occurrence of the search string, or -1 if not found.
 *
 * @example
 * ```typescript
 * findFirst('Hello World', 'world', ESearchCase.IgnoreCase); // returns 6
 * findFirst('Hello World', 'world'); // returns -1
 * findFirst('Hello World', 'Hello'); // returns 0
 * ```
 */
export function findFirst(
  view: string,
  search: string,
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
): number {
  const { processedView, processedSearch } = processString(view, search, searchCase);
  return processedView.indexOf(processedSearch);
}

/**
 * Finds the last occurrence of a search string within a given view string.
 *
 * @param view - The string to search within.
 * @param search - The string to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @returns The index of the last occurrence of the search string, or -1 if not found.
 *
 * @example
 * ```typescript
 * findLast('Hello World Hello', 'hello', ESearchCase.IgnoreCase); // returns 12
 * findLast('Hello World Hello', 'world'); // returns 6
 * findLast('Hello World Hello', 'Hello'); // returns 12
 * ```
 */
export function findLast(
  view: string,
  search: string,
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
): number {
  const { processedView, processedSearch } = processString(view, search, searchCase);
  return processedView.lastIndexOf(processedSearch);
}

/**
 * Finds the first occurrence of any string from a list of search strings within a given view string.
 *
 * @param view - The string to search within.
 * @param searchStrings - An array of strings to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @param outMatchIndex - An optional array to store the index of the matched search string.
 * @returns The index of the first occurrence of any search string, or -1 if none are found.
 *
 * @example
 * ```typescript
 * findFirstOfAny('Hello World', ['world', 'hello'], ESearchCase.IgnoreCase); // returns 0
 * findFirstOfAny('Hello World', ['world', 'hello']); // returns 6
 * findFirstOfAny('Hello World', ['foo', 'bar']); // returns -1
 * ```
 */
export function findFirstOfAny(
  view: string,
  searchStrings: string[],
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
  outMatchIndex: number[] = [],
): number {
  const { processedView } = processString(view, '', searchCase);
  const processedSearchStrings = searchStrings.map(s => {
    const { processedSearch } = processString('', s, searchCase);
    return processedSearch;
  });

  for (let i = 0; i < processedSearchStrings.length; i++) {
    const index = processedView.indexOf(processedSearchStrings[i]);
    if (index !== -1) {
      if (outMatchIndex) {
        outMatchIndex.push(i);
      }
      return index;
    }
  }
  return -1;
}

/**
 * Finds the last occurrence of any string from a list of search strings within a given view string.
 *
 * @param view - The string to search within.
 * @param searchStrings - An array of strings to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @param outMatchIndex - An optional array to store the index of the matched search string.
 * @returns The index of the last occurrence of any search string, or -1 if none are found.
 *
 * @example
 * ```typescript
 * findLastOfAny('Hello World Hello', ['world', 'hello'], ESearchCase.IgnoreCase); // returns 12
 * findLastOfAny('Hello World Hello', ['world', 'hello']); // returns 12
 * findLastOfAny('Hello World Hello', ['foo', 'bar']); // returns -1
 * ```
 */
export function findLastOfAny(
  view: string,
  searchStrings: string[],
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
  outMatchIndex: number[] = [],
): number {
  const { processedView } = processString(view, '', searchCase);
  const processedSearchStrings = searchStrings.map(s => {
    const { processedSearch } = processString('', s, searchCase);
    return processedSearch;
  });

  for (let i = processedSearchStrings.length - 1; i >= 0; i--) {
    const index = processedView.lastIndexOf(processedSearchStrings[i]);
    if (index !== -1) {
      if (outMatchIndex) {
        outMatchIndex.push(i);
      }
      return index;
    }
  }
  return -1;
}

/**
 * Finds the first occurrence of a search character within a given view string.
 *
 * @param view - The string to search within.
 * @param searchChar - The character to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @returns The index of the first occurrence of the search character, or -1 if not found.
 *
 * @example
 * ```typescript
 * findFirstChar('Hello World', 'w', ESearchCase.IgnoreCase); // returns 6
 * findFirstChar('Hello World', 'W'); // returns 6
 * findFirstChar('Hello World', 'H'); // returns 0
 * ```
 */
export function findFirstChar(
  view: string,
  searchChar: string,
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
): number {
  const { processedView, processedSearch } = processString(view, searchChar, searchCase);
  return processedView.indexOf(processedSearch);
}

/**
 * Finds the last occurrence of a search character within a given view string.
 *
 * @param view - The string to search within.
 * @param searchChar - The character to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @returns The index of the last occurrence of the search character, or -1 if not found.
 *
 * @example
 * ```typescript
 * findLastChar('Hello World Hello', 'o', ESearchCase.IgnoreCase); // returns 15
 * findLastChar('Hello World Hello', 'o'); // returns 15
 * findLastChar('Hello World Hello', 'H'); // returns 12
 * ```
 */
export function findLastChar(
  view: string,
  searchChar: string,
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
): number {
  const { processedView, processedSearch } = processString(view, searchChar, searchCase);
  return processedView.lastIndexOf(processedSearch);
}

/**
 * Finds the first occurrence of any character from a list of search characters within a given view string.
 *
 * @param view - The string to search within.
 * @param searchChars - An array of characters to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @param outMatchIndex - An optional array to store the index of the matched search character.
 * @returns The index of the first occurrence of any search character, or -1 if none are found.
 *
 * @example
 * ```typescript
 * findFirstOfAnyChar('Hello World', ['w', 'h'], ESearchCase.IgnoreCase); // returns 0
 * findFirstOfAnyChar('Hello World', ['W', 'H']); // returns 0
 * findFirstOfAnyChar('Hello World', ['x', 'y']); // returns -1
 * ```
 */
export function findFirstOfAnyChar(
  view: string,
  searchChars: string[],
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
  outMatchIndex: number[] = [],
): number {
  const { processedView } = processString(view, '', searchCase);
  const processedSearchChars = searchChars.map(c => {
    const { processedSearch } = processString('', c, searchCase);
    return processedSearch;
  });

  for (let i = 0; i < processedSearchChars.length; i++) {
    const index = processedView.indexOf(processedSearchChars[i]);
    if (index !== -1) {
      if (outMatchIndex) {
        outMatchIndex.push(i);
      }
      return index;
    }
  }
  return -1;
}

/**
 * Finds the last occurrence of any character from a list of search characters within a given view string.
 *
 * @param view - The string to search within.
 * @param searchChars - An array of characters to search for.
 * @param searchCase - Enum to specify case sensitivity. Defaults to `ESearchCase.CaseSensitive`.
 * @param outMatchIndex - An optional array to store the index of the matched search character.
 * @returns The index of the last occurrence of any search character, or -1 if none are found.
 *
 * @example
 * ```typescript
 * findLastOfAnyChar('Hello World Hello', ['o', 'h'], ESearchCase.IgnoreCase); // returns 15
 * findLastOfAnyChar('Hello World Hello', ['O', 'H']); // returns 15
 * findLastOfAnyChar('Hello World Hello', ['x', 'y']); // returns -1
 * ```
 */
export function findLastOfAnyChar(
  view: string,
  searchChars: string[],
  searchCase: ESearchCase = ESearchCase.CaseSensitive,
  outMatchIndex: number[] = [],
): number {
  const { processedView } = processString(view, '', searchCase);
  const processedSearchChars = searchChars.map(c => {
    const { processedSearch } = processString('', c, searchCase);
    return processedSearch;
  });

  for (let i = processedSearchChars.length - 1; i >= 0; i--) {
    const index = processedView.lastIndexOf(processedSearchChars[i]);
    if (index !== -1) {
      if (outMatchIndex) {
        outMatchIndex.push(i);
      }
      return index;
    }
  }
  return -1;
}
