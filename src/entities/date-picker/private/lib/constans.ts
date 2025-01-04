import { MAX_INT_32 } from '@/lib/constants/numeric';
import { NumericLimits } from '@/lib/core';

export const WEEKDAY_LETTERS = [
  'lng_weekday1',
  'lng_weekday2',
  'lng_weekday3',
  'lng_weekday4',
  'lng_weekday5',
  'lng_weekday6',
  'lng_weekday7',
];

export const MONTH_LIST = [
  'lng_first_month',
  'lng_second_month',
  'lng_third_month',
  'lng_fourth_month',
  'lng_fifth_month',
  'lng_sixth_month',
  'lng_seventh_month',
  'lng_eighth_month',
  'lng_ninth_month',
  'lng_tenth_month',
  'lng_eleventh_month',
  'lng_twelfth_month',

  // for next year
  'lng_first_month',
  'lng_second_month',
  'lng_third_month',
  'lng_fourth_month',
];

export const TRANSITION_DURATION = 1000;
export const MAX_SAFE_DATE = 8640000000000000;
export const MIN_SAFE_DATE = -8640000000000000;
export const COLUMNS = 7;
export const ROWS = 6;
export const MAX_DATE_CELLS = COLUMNS * ROWS;
export const LIGHT_SIZE = 180; //px

export const CELL_SIZE = 46;

export enum ZoomLevel {
  WEEK = 1,
  MONTH,
  YEAR,
}

export const PREVIOUS_MONTH = -1;
export const CURRENT_MONTH = 0;
export const NEXT_MONTH = 1;

export const JANUARY = 0;
export const DECEMBER = 11;
