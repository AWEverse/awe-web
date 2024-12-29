import { areDeepEqual } from '@/lib/utils/areDeepEqual';

//                                                !                     !
// входная строка:      * * * * * * * * * * # [-U-] [V] * * * * * * * * # [V] * * * * * *
// 1. Совпало UV:         * [-U-] [V] * * * * [-U-] [V]
// 2. Затем совпало V:                      * [-U-] [V] * * * * * * [-U-] [V]
// Сдвиг по эвристике суффиксов:                * [-U-] [V] * * * * * * [-U-] [V]
// Турбосдвиг:                                    * [-U-] [V] * * * * * * [-U-] [V]

// Как видно на рисунке, минимальный сдвиг шаблона будет равен длине части, совпавшей на предыдущем шаге (|U|).
// Это происходит потому, что при другом сдвиге два символа во входной строке будут различны, но одинаковы в шаблоне.
// Эвристика турбосдвига использует эту ситуацию, чтобы значительно уменьшить количество необходимых сравнений.
// Алгоритм может выполнить свою работу за 2n сравнений в худшем случае до первого совпадения.

/**
 * Finds the first occurrence of a sequence of elements (`pattern`) within another sequence (`text`).
 * This implementation uses the Turbo-Boyer-Moore algorithm for optimal performance.
 *
 * @param text The array to search within.
 * @param pattern The sequence (subarray) to search for.
 * @returns The starting index of the first occurrence of the "pattern" sequence in "text", or -1 if not found.
 * */
const findSubstring = <T>(text: T[], pattern: T[]): number => {
  const n = text.length;
  const m = pattern.length;

  if (m === 0) return 0;

  const badCharShift = buildBadCharShift(pattern);
  const suffixShift = buildSuffixShift(pattern);

  let i = 0; // Индекс для текста
  let j = 0; // Индекс для шаблона

  while (i <= n - m) {
    j = m - 1;

    while (j >= 0 && areDeepEqual(text[i + j], pattern[j])) {
      j--;
    }

    if (j < 0) {
      return i;
    } else {
      const shift = Math.max(badCharShift.get(text[i + j]) || m, suffixShift[j]);
      i += shift;
    }
  }

  return -1;
};

function buildBadCharShift<T>(pattern: T[]): Map<T, number> {
  const shift = new Map<T, number>();
  const m = pattern.length;

  for (let i = 0; i < m; i++) {
    shift.set(pattern[i], m - i - 1);
  }

  return shift;
}

function buildSuffixShift<T>(pattern: T[]): number[] {
  const m = pattern.length;
  const shift = new Array(m).fill(m);

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
