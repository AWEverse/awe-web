

export const MAX_SAFE_DATE = 8640000000000000;
export const MIN_SAFE_DATE = -8640000000000000;
export const COLUMNS = 7;
export const ROWS = 6;
export const MAX_DATE_CELLS = COLUMNS * ROWS;
export const LIGHT_SIZE = 180; //px

export const CELL_SIZE = 46;

export enum ZoomLevel {
  WEEK = 0,
  MONTH,
  YEAR,
}

export const PREVIOUS_MONTH = -1;
export const CURRENT_MONTH = 0;
export const NEXT_MONTH = 1;

export const JANUARY = 0;
export const DECEMBER = 11;
export const HISTORY_LIMIT = 50;
