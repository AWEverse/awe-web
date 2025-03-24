import { CELL_SIZE, COLUMNS, ROWS } from '../constans';

const MAX_WIDTH = 100; // 100%
const MAX_HEIGHT = 100; // 100%
const HEIGHT_PER_ROW = MAX_HEIGHT / ROWS;

type Dimensions = {
  widthPercentage: number;
  heightPercentage: number;
};

type Offsets = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

/**
 * Calculate the percentage of a value relative to a dimension
 */
const calculatePercentage = (value: number, dimension: number) => (value * 100) / dimension;

/**
 * Calculate the column index (1-based) for a given date
 */
const calculateColumn = (date: number) => ((date % COLUMNS) + COLUMNS) % COLUMNS || COLUMNS;

/**
 * Generate a CSS clip-path polygon based on the given dimensions and offsets
 */
function generateClipPath(
  topLeft: Dimensions,
  bottomRight: Dimensions,
  offset: Offsets = { top: 0, left: 0, right: 0, bottom: 0 },
): string {
  const { top, left, right, bottom } = offset;

  return `polygon(
    ${left}% ${topLeft.heightPercentage}%,
    ${topLeft.widthPercentage}% ${topLeft.heightPercentage}%,
    ${topLeft.widthPercentage}% ${top}%,
    ${MAX_WIDTH - right}% ${top}%,
    ${MAX_WIDTH - right}% ${bottomRight.heightPercentage}%,
    ${bottomRight.widthPercentage}% ${bottomRight.heightPercentage}%,
    ${bottomRight.widthPercentage}% ${MAX_HEIGHT - bottom}%,
    ${left}% ${MAX_HEIGHT - bottom}%
  )`.replace(/\s+/g, ' ');
}

/**
 * Calculate grid selection clip path based on start and end dates
 */
export default function calculateGridSelection(startDate: number, endDate: number): string {
  const gridWidth = CELL_SIZE * COLUMNS;
  const gridHeight = CELL_SIZE * ROWS;

  const startRow = Math.ceil(startDate / COLUMNS);
  const startColumn = calculateColumn(startDate);
  const endRow = Math.floor(endDate / COLUMNS);
  const endColumn = calculateColumn(endDate);

  const isLastColumn = endColumn === COLUMNS;

  const topLeft = {
    widthPercentage: calculatePercentage(startColumn * CELL_SIZE, gridWidth),
    heightPercentage: calculatePercentage(startRow * CELL_SIZE, gridHeight),
  };

  const bottomRight = {
    widthPercentage: isLastColumn
      ? MAX_WIDTH
      : calculatePercentage(endColumn * CELL_SIZE, gridWidth),
    heightPercentage: calculatePercentage(endRow * CELL_SIZE, gridHeight),
  };

  const endColumnOffset = endColumn < COLUMNS ? 1 : 0;

  const offsets = {
    top: HEIGHT_PER_ROW * (startRow - 1),
    left: 0,
    right: 0,
    bottom: HEIGHT_PER_ROW * (ROWS - endRow - endColumnOffset),
  };

  return generateClipPath(topLeft, bottomRight, offsets);
}
