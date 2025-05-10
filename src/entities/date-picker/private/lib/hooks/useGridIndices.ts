import { useMemo } from 'react';

interface UseGridIndicesProps {
  range: { start: Date | null; end: Date | null };
  referenceDate: Date; // The month being displayed
  gridSize: { columns: number; rows: number };
}

interface GridIndices {
  start: number;
  end: number;
}

export function useGridIndices({ range, referenceDate, gridSize }: UseGridIndicesProps): GridIndices | null {
  return useMemo(() => {
    if (!range.start || !range.end) return null;

    const totalCells = gridSize.columns * gridSize.rows;
    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth();

    const firstDayOfMonth = new Date(refYear, refMonth, 1);
    const lastDayOfMonth = new Date(refYear, refMonth + 1, 0);
    const firstDayOffset = firstDayOfMonth.getDay(); // 0-6 for Sun-Sat

    const dateToIndex = (date: Date): number => {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      if (normalizedDate < firstDayOfMonth) {
        const daysBefore = Math.floor((firstDayOfMonth.getTime() - normalizedDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.max(0, firstDayOffset - daysBefore);
      }

      if (normalizedDate > lastDayOfMonth) {
        const daysAfter = Math.floor((normalizedDate.getTime() - lastDayOfMonth.getTime()) / (24 * 60 * 60 * 1000));
        return Math.min(totalCells - 1, firstDayOffset + lastDayOfMonth.getDate() + daysAfter - 1);
      }

      return firstDayOffset + normalizedDate.getDate() - 1;
    };

    const startIndex = dateToIndex(range.start);
    const endIndex = dateToIndex(range.end);

    return {
      start: Math.max(0, Math.min(totalCells - 1, startIndex)),
      end: Math.max(0, Math.min(totalCells - 1, endIndex))
    };
  }, [range.start, range.end, referenceDate, gridSize.columns, gridSize.rows]);
}
