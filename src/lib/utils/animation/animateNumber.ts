import { requestMeasure } from '@/lib/modules/fastdom/fastdom';
import { animateInstantly } from './animate';
import { derivative } from '@/lib/core';

type TimingFn = (t: number) => number;

export const timingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t ** 1.675,
  easeOut: (t: number) => -1 * t ** 1.675,
  easeInOut: (t: number) => 0.5 * (Math.sin((t - 0.5) * Math.PI) + 1),
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t ** 3,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t ** 3 : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeInQuart: (t: number) => t ** 4,
  easeOutQuart: (t: number) => 1 - --t * t ** 3,
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - 8 * --t * t ** 3),
  easeInQuint: (t: number) => t ** 5,
  easeOutQuint: (t: number) => 1 + --t * t ** 4,
  easeInOutQuint: (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 + 16 * --t * t ** 4),
};

type AnimateNumberProps<T extends number | number[]> = {
  to: T;
  from: T;
  duration: number;
  onUpdate: (value: T) => void;
  timing?: TimingFn;
  onEnd?: (isCanceled?: boolean) => void;
};

function updateNumber(
  from: number,
  to: number,
  progress: number,
  onUpdate: (value: number) => void,
) {
  const updatedValue = from + (to - from) * progress;
  onUpdate(updatedValue);
}

function updateArray(
  from: number[],
  to: number[],
  progress: number,
  onUpdate: (value: number[]) => void,
) {
  const updatedValues = from.map((startValue, index) => {
    return startValue + (to[index] - startValue) * progress;
  });
  onUpdate(updatedValues);
}

export function animateNumber<T extends number | number[]>({
  timing = timingFunctions.linear,
  onUpdate,
  duration,
  onEnd,
  from,
  to,
}: AnimateNumberProps<T>) {
  const startTime = Date.now();
  let isCanceled = false;

  animateInstantly(requestMeasure, () => {
    if (isCanceled) return false;

    const currentTime = Date.now();
    const elapsedTime = Math.min((currentTime - startTime) / duration, 1);

    const progress = derivative(timing, elapsedTime);

    if (typeof from === 'number' && typeof to === 'number') {
      updateNumber(from, to, progress, onUpdate as (value: number) => void);
    } else if (Array.isArray(from) && Array.isArray(to)) {
      updateArray(from, to, progress, onUpdate as (value: number[]) => void);
    }

    if (elapsedTime === 1) {
      onEnd?.();
    }

    return elapsedTime < 1;
  });

  return () => {
    isCanceled = true;
    onEnd?.(true);
  };
}

export function applyStyles(element: HTMLElement, css: Record<string, string>) {
  Object.assign(element.style, css);
}
