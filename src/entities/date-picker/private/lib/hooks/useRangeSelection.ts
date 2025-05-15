import { useState, useCallback } from 'react';

export interface RangeSelection {
  start: Date | null;
  end: Date | null;
}

interface UseRangeSelectionProps {
  onRangeSelect?: (range: { start: Date; end: Date }) => void;
  onRangeChange?: (range: RangeSelection) => void;
  initialRange?: RangeSelection;
  minDate?: Date;
  maxDate?: Date;
}

export function useRangeSelection({
  onRangeSelect,
  onRangeChange,
  initialRange,
  minDate,
  maxDate,
}: UseRangeSelectionProps = {}) {
  const [range, setInternalRange] = useState<RangeSelection>(initialRange ?? { start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);

  const isDateValid = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  }, [minDate, maxDate]);

  const setRange = useCallback((newRange: RangeSelection | ((prev: RangeSelection) => RangeSelection)) => {
    setInternalRange((prev) => {
      const resolvedRange = typeof newRange === 'function' ? newRange(prev) : newRange;
      onRangeChange?.(resolvedRange);
      return resolvedRange;
    });
  }, [onRangeChange]);

  const startSelection = useCallback((date: Date) => {
    if (!isDateValid(date)) return;
    setRange({ start: date, end: null });
    setIsSelecting(true);
  }, [isDateValid, setRange]);

  const updateSelection = useCallback((date: Date) => {
    if (!isSelecting || !range.start || !isDateValid(date)) return;
    if (range.start.getTime() === date.getTime()) return;

    setRange(prev => ({ ...prev, end: date }));
  }, [isSelecting, range.start, isDateValid, setRange]);

  const completeSelection = useCallback((date: Date) => {
    if (!isSelecting || !range.start || !isDateValid(date)) return;
    if (range.start.getTime() === date.getTime()) return;

    const [start, end] = [range.start, date].sort((a, b) => a.getTime() - b.getTime());
    setRange({ start, end });
    setIsSelecting(false);
    onRangeSelect?.({ start, end });
    return { start, end };
  }, [isSelecting, range.start, isDateValid, setRange, onRangeSelect]);

  const cancelSelection = useCallback(() => {
    setRange({ start: null, end: null });
    setIsSelecting(false);
  }, [setRange]);

  return {
    range,
    isSelecting,
    startSelection,
    updateSelection,
    completeSelection,
    cancelSelection,
    setRange,
  };
}
