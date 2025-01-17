const createEaseIn = (power: number) => (t: number) => t ** power;
const createEaseOut = (power: number) => (t: number) => 1 - (--t) ** power;
const createEaseInOut = (power: number) => (t: number) => {
  if (t < 0.5) {
    return 2 ** (power - 1) * t ** power;
  }

  return 1 - (--t) ** power * 2 ** (power - 1);
};

export const timingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t ** 1.675,
  easeOut: (t: number) => -(t ** 1.675) + 1,
  easeInOut: (t: number) => 0.5 * (Math.sin((t - 0.5) * Math.PI) + 1),

  easeInQuad: createEaseIn(2),
  easeOutQuad: createEaseOut(2),
  easeInOutQuad: createEaseInOut(2),

  easeInCubic: createEaseIn(3),
  easeOutCubic: createEaseOut(3),
  easeInOutCubic: createEaseInOut(3),

  easeInQuart: createEaseIn(4),
  easeOutQuart: createEaseOut(4),
  easeInOutQuart: createEaseInOut(4),

  easeInQuint: createEaseIn(5),
  easeOutQuint: createEaseOut(5),
  easeInOutQuint: createEaseInOut(5),
};
