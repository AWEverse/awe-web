type VibrationPatternArray = number | number[];

export const vibrate = (pattern: VibrationPatternArray) => {
  if (!navigator.vibrate) return;
  navigator.vibrate(pattern);
};

export const vibrateShort = () => navigator.vibrate?.([25]) ?? undefined;
export const vibrateLong = () => navigator.vibrate?.([100, 25, 100]) ?? undefined;
