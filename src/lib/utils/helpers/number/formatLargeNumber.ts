import { clamp } from '../../math';

interface FormatOptions {
  fractionDigits?: number;
  removeDecimalOnWholeNumber?: boolean;
  locale?: string;
}

const units: Array<{ value: number; suffix: string }> = [
  { value: 1e15, suffix: ' квадр' },
  { value: 1e12, suffix: ' трлн' },
  { value: 1e9, suffix: ' млрд' },
  { value: 1e6, suffix: ' млн' },
  { value: 1e3, suffix: ' тыс' },
];

function formatLargeNumber(num?: number, options: FormatOptions = {}): string | number {
  if (num == null || typeof num !== 'number' || isNaN(num)) {
    return -1;
  }

  const { fractionDigits = 1, removeDecimalOnWholeNumber = true, locale = 'en-US' } = options;

  const clampedFractionDigits = clamp(fractionDigits, 0, 20);
  const isWholeNumber = num % 1 === 0;

  const unit = units.find(unit => num >= unit.value);

  if (unit) {
    const formattedNum = new Intl.NumberFormat(locale, {
      minimumFractionDigits: removeDecimalOnWholeNumber && isWholeNumber ? 0 : clampedFractionDigits,
      maximumFractionDigits: clampedFractionDigits,
    }).format(num / unit.value);

    return `${formattedNum}${unit.suffix}`;
  }

  return num;
}

export default formatLargeNumber;
