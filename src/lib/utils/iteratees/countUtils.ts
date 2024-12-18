export const countBy = <T>(arr: T[], callback: (element: T) => boolean): number => {
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i])) {
      count++;
    }
  }

  return count;
};

export const countByKey = <T, K extends keyof unknown>(array: T[], callback: (item: T) => K): Record<K, number> => {
  const result: Record<K, number> = {} as Record<K, number>;

  for (let i = 0; i < array.length; i++) {
    const key = callback(array[i]);
    result[key] = (result[key] || 0) + 1;
  }

  return result;
};
