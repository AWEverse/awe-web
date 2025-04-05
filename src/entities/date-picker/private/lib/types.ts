import { ZoomLevel } from './constans';

export type CalendarMode = 'future' | 'past' | 'all';

export type CalendarAnimationType = 'LTR' | 'RTL' | 'zoom';

export enum EDatePickerView {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export type ISelectDate = Partial<{
  day: number;
  month: number;
  year: number;
  level: ZoomLevel;
}>;

export type Milliseconds = number;


export interface DateState {
  currentSystemDate: Date;
  userSelectedDate: Date;
}

export type DateRange = Partial<{ from: Date; to: Date }>;

export type CalendarViewProps = {
  date: DateState;
  mode?: CalendarMode;

  onClick?: (event: React.MouseEvent | React.TouchEvent) => void;
  onSelectDate?: (date: ISelectDate) => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: NoneToVoidFunction;
  onRightClick?: (date: ISelectDate) => void;
};
