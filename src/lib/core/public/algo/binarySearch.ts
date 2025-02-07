/**
 * Функция advancedBinarySearch выполняет бинарный поиск по отсортированному массиву.
 *
 * @param arr Отсортированный массив элементов.
 * @param target Целевое значение, которое необходимо найти.
 * @param compare Функция сравнения, которая принимает элемент массива и target.
 *                Должна возвращать:
 *                  - отрицательное число, если элемент < target,
 *                  - 0, если элемент === target,
 *                  - положительное число, если элемент > target.
 * @param options Дополнительные опции:
 *                  - findFirstGreater (boolean): если true, функция вернет индекс первого элемента, большего target, в случае отсутствия точного совпадения.
 *                  - findClosest (boolean): если true, возвращается индекс элемента, ближайшего по значению к target.
 *
 * @returns Индекс найденного элемента или -1, если элемент не найден.
 */
export default function binarySearch<T>(
  arr: T[],
  target: T,
  compare: (elem: T, target: T) => number,
  options?: {
    findFirstGreater?: boolean;
    findClosest?: boolean;
  },
): number {
  let low = 0;
  let high = arr.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cmp = compare(arr[mid], target);

    if (cmp === 0) {
      // Точное совпадение найдено.
      result = mid;
      // Если требуется найти первый индекс в случае дубликатов,
      // продолжаем поиск в левой половине.
      high = mid - 1;
    } else if (cmp < 0) {
      low = mid + 1;
    } else {
      // cmp > 0
      result = mid;
      high = mid - 1;
    }
  }

  if (result !== -1) {
    // Если требуемый параметр findFirstGreater установлен, то результат уже является индексом первого элемента, большего target.
    if (options?.findFirstGreater) {
      return result;
    }
    // Если был найден точный результат, возвращаем его
    if (compare(arr[result], target) === 0) {
      return result;
    }
  }

  // Если точного совпадения не найдено, и включена опция findClosest – ищем ближайший элемент.
  if (options?.findClosest) {
    // low указывает на первый элемент больше target,
    // high указывает на последний элемент меньше target.
    if (low >= arr.length) {
      return high;
    }
    if (high < 0) {
      return low;
    }
    // Выбираем элемент, который ближе к target.
    return Math.abs(compare(arr[low], target)) <
      Math.abs(compare(arr[high], target))
      ? low
      : high;
  }

  return result; // Если не найдено точное совпадение и опций нет, вернём индекс первого элемента больше target (или -1, если такого нет).
}
