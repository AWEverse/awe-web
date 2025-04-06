import { useMemo } from "react";

type Orientation = 'horizontal' | 'vertical';

type CellRange = {
  start: number;
  end: number;
};

type SVGPathOptions = {
  cellSize: number;
  columns: number;
  rows: number;
  orientation?: Orientation;
};

function generateCellPath(x: number, y: number, cellSize: number): string {
  return [
    `M${x},${y}`,
    `h${cellSize}`,
    `v${cellSize}`,
    `h${-cellSize}`,
    `Z`
  ].join(' ');
}

function generatePathsForNonRectangularRange(
  range: CellRange,
  options: SVGPathOptions
): string[] {
  const { cellSize, columns, rows, orientation = 'horizontal' } = options;
  const { start, end } = range;

  const from = Math.min(start, end);
  const to = Math.max(start, end);

  const paths: string[] = [];

  for (let index = from; index <= to; index++) {
    const row = Math.floor(index / columns);
    const col = index % columns;

    if (row >= rows) continue;

    const x = orientation === 'horizontal' ? col * cellSize : row * cellSize;
    const y = orientation === 'horizontal' ? row * cellSize : col * cellSize;

    paths.push(generateCellPath(x, y, cellSize));
  }

  return paths;
}

function generateLabelPath(range: CellRange, options: SVGPathOptions): string {
  const { cellSize, columns, orientation = 'horizontal' } = options;
  const index = Math.min(range.start, range.end);
  const row = Math.floor(index / columns);
  const col = index % columns;

  const x = orientation === 'horizontal' ? col * cellSize : row * cellSize;
  const y = orientation === 'horizontal' ? row * cellSize : col * cellSize;

  return `M${x},${y} h${cellSize}`;
}

export const useGridSelection = (
  range: CellRange | null,
  options: SVGPathOptions
) => {
  return useMemo(() => {
    if (!range) return { path: "", labelPath: "", count: 0 };

    const paths = generatePathsForNonRectangularRange(range, options);
    const labelPath = generateLabelPath(range, options);
    const path = paths.join(" ");

    return {
      path,
      labelPath,
      count: Math.abs(range.end - range.start) + 1,
    };
  }, [range, options]);
};
