import { clamp } from '@/lib/core/public/math/utils';

interface FormatOptions {
  fractionDigits?: number;
  removeDecimalOnWholeNumber?: boolean;
  locale?: string;
  scientificNotationThreshold?: number;
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
    return '-';
  }

  if (!isFinite(num)) {
    return num > 0 ? 'Infinity' : '-Infinity';
  }

  const {
    fractionDigits = 1,
    removeDecimalOnWholeNumber = true,
    locale = 'en-US',
    scientificNotationThreshold = 1e18, // New: Default threshold
  } = options;

  const clampedFractionDigits = clamp(fractionDigits, 0, 20);
  const isWholeNumber = num % 1 === 0;

  if (Math.abs(num) >= scientificNotationThreshold || Math.abs(num) < 1e-3) {
    return num.toExponential(clampedFractionDigits);
  }

  const unit = units.find(unit => Math.abs(num) >= unit.value);

  if (unit) {
    const formattedNum = new Intl.NumberFormat(locale, {
      minimumFractionDigits:
        removeDecimalOnWholeNumber && isWholeNumber ? 0 : clampedFractionDigits,
      maximumFractionDigits: clampedFractionDigits,
    }).format(num / unit.value);

    return `${formattedNum}${unit.suffix}`;
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: removeDecimalOnWholeNumber && isWholeNumber ? 0 : clampedFractionDigits,
    maximumFractionDigits: clampedFractionDigits,
  }).format(num);
}

export default formatLargeNumber;
