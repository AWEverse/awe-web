import { ZoomLevel } from './constans';

export type CalendarMode = 'future' | 'past' | 'all';

export type CalendarAnimationType = 'LTR' | 'RTL' | 'zoomIn' | 'zoomOut';

export type ISelectDate = Partial<{
  day: number;
  month: number;
  year: number;
  level: ZoomLevel;
}>;

export type Milliseconds = number;

export type DateRangeData = {
  currentSystemDate: Date;
  userSelectedDate: Date;
  dateRange: DateRange;
};

export type DateRange = Partial<{ from: Date; to: Date }>;

export type CalendarViewProps = {
  date: DateRangeData;
  mode?: CalendarMode;

  onClick?: (event: React.MouseEvent | React.TouchEvent) => void;
  onSelectDate?: (date: ISelectDate) => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: NoneToVoidFunction;
  onRightClick?: (date: ISelectDate) => void;
};
