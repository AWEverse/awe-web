import { REM } from '@/lib/utils/mediaDimensions';
import { AvatarSize } from './types';

const SIZES: Record<AvatarSize, number> = {
  micro: 1.125 * REM,
  tiny: 2.125 * REM,
  mini: 1.625 * REM,
  small: 2.25 * REM,
  'small-mobile': 2.625 * REM,
  medium: 2.875 * REM,
  large: 3.5 * REM,
  giant: 5.125 * REM,
  jumbo: 7.625 * REM,
};

const BLUE = ['#34C578', '#3CA3F3'];
const GREEN = ['#C9EB38', '#09C167'];
const PURPLE = ['#A667FF', '#55A5FF'];
const GRAY = '#C4C9CC';
const DARK_GRAY = '#737373';
const STROKE_WIDTH = 0.125 * REM;
const STROKE_WIDTH_READ = 0.0625 * REM;
const GAP_PERCENT = 2;
const SEGMENTS_MAX = 45; // More than this breaks rendering in Safari and Chrome

const GAP_PERCENT_EXTRA = 10;
const EXTRA_GAP_ANGLE = Math.PI / 4;
const EXTRA_GAP_SIZE = (GAP_PERCENT_EXTRA / 100) * (2 * Math.PI);
const EXTRA_GAP_START = EXTRA_GAP_ANGLE - EXTRA_GAP_SIZE / 2;
const EXTRA_GAP_END = EXTRA_GAP_ANGLE + EXTRA_GAP_SIZE / 2;

export {
  SIZES,
  BLUE,
  GREEN,
  PURPLE,
  GRAY,
  DARK_GRAY,
  STROKE_WIDTH,
  STROKE_WIDTH_READ,
  GAP_PERCENT,
  SEGMENTS_MAX,
  GAP_PERCENT_EXTRA,
  EXTRA_GAP_SIZE,
  EXTRA_GAP_START,
  EXTRA_GAP_END,
};
