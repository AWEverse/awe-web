import { COLUMNS } from '../../private/lib/constans';
import calculateGridSelection from '../../private/lib/helpers/calculateGridSelection';

interface DateRange {
  from?: Date;
  to?: Date;
}

class DatePickerService {
  calculateIsDisabled = (
    isFutureMode: boolean,
    isPastMode: boolean,
    minDate: Date | null,
    maxDate: Date | null,
    selectedDate: Date,
  ) => {
    return (isFutureMode && selectedDate < minDate!) || (isPastMode && selectedDate > maxDate!);
  };

  calculateClipPathValue = (
    dateRange: DateRange,
    gridPosition: { rows: number; columns: number },
  ) => {
    if (!dateRange.from) return 'none';
    const startIndex = 0;
    const lastIndex = gridPosition.rows * COLUMNS + gridPosition.columns + 1;
    return calculateGridSelection(startIndex, lastIndex);
  };
}

export const datePickerService = new DatePickerService();
