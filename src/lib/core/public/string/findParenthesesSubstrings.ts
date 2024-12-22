type BraketsPair<T extends string = '(', U extends string = ')'> = T extends U ? never : [T, U];

/**
 * Finds all substrings enclosed in parentheses in a string.
 *
 * @param str The string to search within.
 * @param brakets The pair of opening and closing brackets to use. Default is `['(', ')']`.
 * @returns An array of substrings enclosed in parentheses.
 */
/**
 * Finds and extracts substrings enclosed in specified parentheses or brackets from a given string.
 *
 * @param str - The input string to search for substrings.
 * @param brakets - An optional tuple specifying the opening and closing brackets to look for. Defaults to `['(', ')']`.
 * @returns An array of substrings found within the specified brackets. If the brackets are not balanced, returns an empty array.
 *
 * @example
 * ```typescript
 * findParenthesesSubstrings("This is a test (with some content) and (another one)");
 * // Returns: ["with some content", "another one"]
 *
 * findParenthesesSubstrings("Nested (example (with nested) content)");
 * // Returns: ["example (with nested) content"]
 *
 * findParenthesesSubstrings("Unbalanced (example");
 * // Returns: []
 * ```
 */
export default function findParenthesesSubstrings(
  str: string,
  brakets: BraketsPair = ['(', ')'],
): string[] {
  const [open, close] = brakets;

  const stack: string[] = [];
  const result: string[] = [];

  let currentSubstring = '';

  let openCount = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === open) {
      if (openCount > 0) {
        currentSubstring += char;
      }
      stack.push(char);
      openCount++;
    } else if (char === close) {
      if (stack.length === 0) {
        return [];
      }

      stack.pop();
      openCount--;

      if (openCount > 0) {
        currentSubstring += char;
      } else {
        currentSubstring += char;
        const numbers = currentSubstring
          .slice(1, -1)
          .trim()
          .split(' ')
          .filter(item => item.trim());

        if (numbers.length > 0) {
          result.push(numbers.join(' '));
        }
        currentSubstring = '';
      }
    } else {
      if (openCount > 0) {
        currentSubstring += char;
      }
    }
  }

  if (stack.length > 0) {
    return [];
  }

  return result;
}
