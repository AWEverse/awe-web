import { CELL_SIZE, COLUMNS, ROWS } from '../constans';

const MAX_WIDTH = 100;
const MAX_HEIGHT = 100;

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

  const leftOffset = offset.left;
  const topOffset = offset.top;
  const rightOffset = offset.right;
  const bottomOffset = offset.bottom;

  const polygonPoints = [
    // Top-left corner
    `${leftOffset}% ${topLeftHeight}%`,

    // Top-right corner
    `${topLeftWidth}% ${topLeftHeight}%`,

    // Bottom-right corner of the cutout
    `${topLeftWidth}% ${topOffset}%`,

    // Right corner of the container
    `${MAX_WIDTH - rightOffset}% ${topOffset}%`,

    // Bottom-right corner of the container
    `${MAX_WIDTH - rightOffset}% ${bottomRightHeight}%`,

    // Bottom-right corner of the cutout
    `${bottomRightWidth}% ${bottomRightHeight}%`,

    // Bottom-left corner of the container
    `${bottomRightWidth}% ${MAX_WIDTH - bottomOffset}%`,

    // Top-left corner of the container
    `${leftOffset}% ${MAX_WIDTH - bottomOffset}%`,
  ];

  return `polygon(${polygonPoints.join(', ')})`;
}

const calculatePercentage = (value: number, dimention: number) => (value * 100) / dimention;

const calculateColumn = (endDate: number) => ((endDate % COLUMNS) + COLUMNS) % COLUMNS || COLUMNS;

export default function calculateGridSelection(startDate: number, endDate: number) {
  
  if (startDate > endDate) return;

  const gridWidth = CELL_SIZE * COLUMNS;
  const gridHeight = CELL_SIZE * ROWS;

  const startRow = Math.ceil(startDate / COLUMNS);
  const startColumn = calculateColumn(startDate);

  const endRow = Math.floor(endDate / COLUMNS);
  const endColumn = calculateColumn(endDate);

  const topLeft = {
    widthPercentage: calculatePercentage(startColumn * CELL_SIZE, gridWidth),
    heightPercentage: calculatePercentage(startRow * CELL_SIZE, gridHeight),
  };

  const isLastColumn = endColumn === COLUMNS; // Adjusted to check against COLUMNS

  const bottomRight = {
    widthPercentage: isLastColumn ? MAX_WIDTH : calculatePercentage(endColumn * CELL_SIZE, gridWidth),
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
