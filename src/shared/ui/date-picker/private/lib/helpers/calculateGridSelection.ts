import { CELL_SIZE, COLUMNS, ROWS } from '../constans';

const MAX_WIDTH = 100; // 100%
const MAX_HEIGHT = 100; // 100%

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

function generateClipPath(
  topLeft: Dimensions,
  bottomRight: Dimensions,
  offset: Offsets = { top: 0, left: 0, right: 0, bottom: 0 },
): string {
  const { widthPercentage: topLeftWidth, heightPercentage: topLeftHeight } = topLeft;
  const { widthPercentage: bottomRightWidth, heightPercentage: bottomRightHeight } = bottomRight;

  // Offsets for polygon calculations
  const { top: topOffset, left: leftOffset, right: rightOffset, bottom: bottomOffset } = offset;

  // Pre-calculate some boundary values
  const maxWidthMinusRight = MAX_WIDTH - rightOffset;
  const maxWidthMinusBottom = MAX_WIDTH - bottomOffset;

  const polygonPoints = [
    // Top-left corner
    `${leftOffset}% ${topLeftHeight}%`,

    // Top-right corner
    `${topLeftWidth}% ${topLeftHeight}%`,

    // Bottom-right corner of the cutout
    `${topLeftWidth}% ${topOffset}%`,

    // Right corner of the container
    `${maxWidthMinusRight}% ${topOffset}%`,

    // Bottom-right corner of the container
    `${maxWidthMinusRight}% ${bottomRightHeight}%`,

    // Bottom-right corner of the cutout
    `${bottomRightWidth}% ${bottomRightHeight}%`,

    // Bottom-left corner of the container
    `${bottomRightWidth}% ${maxWidthMinusBottom}%`,

    // Top-left corner of the container
    `${leftOffset}% ${maxWidthMinusBottom}%`,
  ];

  return `polygon(${polygonPoints.join(', ')})`;
}

const calculatePercentage = (value: number, dimention: number) => (value * 100) / dimention;

const calculateColumn = (endDate: number) => ((endDate % COLUMNS) + COLUMNS) % COLUMNS || COLUMNS;

export default function calculateGridSelection(startDate: number, endDate: number) {
  const gridWidth = CELL_SIZE * COLUMNS;
  const gridHeight = CELL_SIZE * ROWS;

  const startRow = Math.ceil(startDate / COLUMNS);
  const startColumn = calculateColumn(startDate);

  const endRow = Math.floor(endDate / COLUMNS);
  const endColumn = calculateColumn(endDate);

  const isLastColumn = endColumn === COLUMNS; // Adjusted to check against COLUMNS

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

  const heightPerRow = MAX_HEIGHT / ROWS;

  const offsets = {
    top: heightPerRow * (startRow - 1),
    left: 0,
    right: 0,
    bottom: heightPerRow * (ROWS - endRow - endColumnOffset),
  };

  const clipPathValue = generateClipPath(topLeft, bottomRight, offsets);

  return clipPathValue;
}
