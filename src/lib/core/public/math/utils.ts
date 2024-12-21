export const clamp = (num: number, min: number, max: number, inclusive = true): number => {
  return inclusive ? Math.min(Math.max(num, min), max) : Math.min(Math.max(num, min + 1), max - 1);
};

export const clamp01 = (x: number): number => {
  if (isNaN(x)) return 0;
  return clamp(x, 0, 1);
};

export const isBetween = (
  num: number,
  min: number,
  max: number,
  inclusiveMin = true,
  inclusiveMax = true,
): boolean => {
  return (inclusiveMin ? num >= min : num > min) && (inclusiveMax ? num <= max : num < max);
};

export const round = (num: number, decimals: number = 0): number => {
  const factor = 10 ** decimals;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const lerp = (start: number, end: number, interpolationRatio: number): number => {
  return (1 - interpolationRatio) * start + interpolationRatio * end;
};

export const lerp01 = (x: number): number => {
  return clamp(lerp(0, 1, x), 0, 1);
};

export const roundToNearestEven = (value: number): number => {
  return value % 2 === 0 ? value : value + (value > 0 ? 1 : -1);
};

export const roundToNearestOdd = (value: number): number => {
  return value % 2 !== 0 ? value : value + (value > 0 ? 1 : -1);
};

export const square = (x: number): number => x * x;

export const distance = (...coords: number[]): number => {
  return Math.sqrt(coords.reduce((acc, curr) => acc + square(curr), 0));
};

export const radToDeg = (x: number) => (x * 180) / Math.PI;
export const degToRad = (x: number) => (x * Math.PI) / 180;

export const angle = (x: number, y: number) => Math.atan2(y, x);

export const angleDeg = (x: number, y: number): number => {
  return radToDeg(angle(x, y));
};
export const angleRad = (x: number, y: number): number => {
  return angle(x, y);
};
export const sign = (x: number): number => {
  if (Math.abs(x) < Number.EPSILON) return 0;
  return x > 0 ? 1 : -1;
};

export const clampAngle = (x: number): number => {
  const normalizedAngle = x % (2 * Math.PI);
  return normalizedAngle > Math.PI ? normalizedAngle - 2 * Math.PI : normalizedAngle;
};

export const randomInt = (min: number = 0, max: number = 1) =>
  min + Math.floor(Math.random() * (max - min + 1));
export const randomBool = () => Math.random() > 0.5;

export const randomIndex = <T>(array: T[]) => Math.floor(Math.random() * array.length);
export const randomElementFromArray = <T>(array: T[]) => array[randomIndex(array)];

const randomHex = () => Math.floor(Math.random() * 16777215).toString(16);

export const randomColor = () => `#${randomHex()}`;
export const randomColorRGB = () =>
  `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
export const randomColorRGBA = () =>
  `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256,
  )}, ${Math.floor(Math.random() * 256)}, ${Math.random()})`;
export const randomColorHSL = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
export const randomColorHSLA = () =>
  `hsla(${Math.floor(Math.random() * 360)}, 100%, 50%, ${Math.random()})`;
export const randomColorHEX = () => `#${randomHex()}`;
export const randomColorHEXA = () => `#${randomHex()}${randomHex()}`;
export const randomColorHEXAA = () => `#${randomHex()}${randomHex()}${randomHex()}`;

export const derivative = (f: (x: number) => number, x: number, h: number = 1e-5): number => {
  const epsilon = Number.EPSILON;
  const hAdjusted = Math.max(h, epsilon);

  return (f(x + hAdjusted) - f(x - hAdjusted)) / (2 * hAdjusted);
};

export const median = (numbers: number[]): number => {
  if (!numbers.length) {
    return -1;
  }

  const swap = <T>(arr: T[], i: number, j: number): void => {
    if (i !== j && arr[i] !== undefined && arr[j] !== undefined) {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  };

  const partition = (arr: number[], left: number, right: number, pivotIndex: number): number => {
    let storeIndex = left;
    const pivotValue = arr[pivotIndex];

    swap(arr, pivotIndex, right);

    for (let i = left; i < right; i++) {
      if (arr[i] < pivotValue) {
        swap(arr, i, storeIndex);
        storeIndex++;
      }
    }

    swap(arr, right, storeIndex);

    return storeIndex;
  };

  const quickSelect = (arr: number[], left: number, right: number, k: number): number => {
    if (left === right) {
      return arr[left];
    }

    // Выбираем случайный pivot
    const pivotIndex = Math.floor(Math.random() * (right - left + 1)) + left;
    const pivotNewIndex = partition(arr, left, right, pivotIndex);

    if (k === pivotNewIndex) {
      return arr[k];
    } else if (k < pivotNewIndex) {
      const right = pivotNewIndex - 1;
      return quickSelect(arr, left, right, k);
    } else {
      const left = pivotNewIndex + 1;
      return quickSelect(arr, left, right, k);
    }
  };

  const n = numbers.length;

  if (n % 2 === 1) {
    return quickSelect(numbers, 0, n - 1, Math.floor(n / 2));
  } else {
    const left = 0;
    const right = n - 1;

    const kLeft = Math.floor(n / 2) - 1;
    const kRight = Math.floor(n / 2);

    const leftMedian = quickSelect(numbers, left, right, kLeft);
    const rightMedian = quickSelect(numbers, left, right, kRight);

    return (leftMedian + rightMedian) / 2;
  }
};
