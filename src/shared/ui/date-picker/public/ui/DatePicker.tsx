import { FC, useRef, cloneElement, createRef, useState, memo, ReactElement } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useIntl } from 'react-intl';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { throttle } from '@/lib/utils/schedulers';

import { DateRangeData, ISelectDate } from '../../private/lib/types';
import {
  CELL_SIZE,
  ZoomLevel,
  TRANSITION_DURATION,
  CURRENT_MONTH,
  DECEMBER,
  JANUARY,
  NEXT_MONTH,
  PREVIOUS_MONTH,
  LIGHT_SIZE,
} from '../../private/lib/constans';

import {
  WeekView,
  MonthView,
  YearView,
  DatePickerNavigation,
  WeekdayLabels,
} from '../../private/ui';

import './DatePicker.scss';
import { CSSTransitionProps } from 'react-transition-group/CSSTransition';

import { initGrigPosition, initDateRange } from './config';
import useSelectedOrCurrentDate from '../../private/lib/hooks/useSelectedOrCurrentDate';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';
import useClipPathForDateRange from '../../private/lib/hooks/useClipPathForDateRange';
import useTransitionKey from '../../private/lib/hooks/useTransitionKey';
import useCalendarStyles from '../../private/lib/hooks/useCalendarStyles';
import LightEffect from '@/shared/ui/common/LightEffect';

type Mode = 'future' | 'past' | 'all';

type AnimationType = 'LTR' | 'RTL' | 'zoomIn' | 'zoomOut';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface OwnProps {
  className?: string; // Custom class name for styling
  disabled?: boolean; // Whether the date picker is disabled
  label?: string; // Label text for the picker
  locale?: string; // Locale for date formatting
  minAt?: number; // Minimum allowed date
  maxAt?: number; // Maximum allowed date
  mode?: Mode; // Mode for the picker (single date or range)
  onChange?: (selectedDate: Date) => void; // Callback for when the date changes
  onClear?: () => void; // Callback for when the date is cleared
  placeholder?: string; // Placeholder text for the input field
  readonly?: boolean; // Whether the picker is read-only
  range?: boolean; // Whether the picker is in range mode
  selectedAt?: number; // The currently selected date
}

const LEVELS = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR];

const CALENDAR_VIEWS = {
  [ZoomLevel.WEEK]: WeekView,
  [ZoomLevel.MONTH]: MonthView,
  [ZoomLevel.YEAR]: YearView,
};

/*
25 26 27 28 29 30] 1
2  3  4  5  6  7  8
9  10 (11 (12) 13 14 15
16 17 18 19 (20 21 22
23 24 25 26 27)) 28 29
30 [3 31 1  2  3  4  5 

() - selected range
[] - current month
*/

// (11 (12) 13 14 15 16 17 18 19 (20 21 22 23 24 25 26 27))'
['11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27', '12', '20 21 22 23 24 25 26 27'];

const DatePicker: FC<OwnProps> = ({ selectedAt, mode }) => {
  const { formatMessage } = useIntl();
  const initSelectedDate = useSelectedOrCurrentDate(selectedAt);

  const nodeRef = createRef<HTMLDivElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const direction = useRef<AnimationType>('LTR');
  const selectedCount = useRef(0);
  const isLongPressActive = useRef(false);

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);
  const [gridPosition, setGridPosition] = useState(initGrigPosition);
  const [dateRange, setDateRange] = useState<DateRange>(initDateRange);

  // current is for display on grid and second for user selection
  const [date, setDate] = useState<DateRangeData>({
    currentSystemDate: initSelectedDate,
    userSelectedDate: initSelectedDate,
  });

  const isDisabledSelectionRange = zoomLevel !== ZoomLevel.WEEK;

  const clipPathValue = useClipPathForDateRange(dateRange, gridPosition, isDisabledSelectionRange);
  const transitionKey = useTransitionKey(direction, zoomLevel, date.currentSystemDate);

  const handlePrevMonth = useLastCallback(() => updateMonth(PREVIOUS_MONTH));
  const handleNextMonth = useLastCallback(() => updateMonth(NEXT_MONTH));

  const setAnimationDirection = useLastCallback((_direction: AnimationType) => {
    direction.current = _direction;
  });

  const setLongPressActive = useLastCallback((value?: boolean) => {
    isLongPressActive.current = value ?? !isLongPressActive.current;
  });

  const updateMonth = useLastCallback((increment: number) => {
    setAnimationDirection(increment > 0 ? 'RTL' : 'LTR');

    setDate(prevDate => {
      const currentSystemDateCopy = new Date(prevDate.currentSystemDate);
      currentSystemDateCopy.setDate(1);
      currentSystemDateCopy.setMonth(currentSystemDateCopy.getMonth() + increment);

      return { ...prevDate, currentSystemDate: currentSystemDateCopy };
    });
  });

  const handleSelectDate = useLastCallback(
    ({ day = 1, month = 0, year = 0, level = zoomLevel }: ISelectDate = {}) => {
      const newDateCopy = new Date(year, month, day);

      if (!isDisabledSelectionRange) {
        const currentMonth = date.currentSystemDate.getMonth();
        const targetMonth = newDateCopy.getMonth();

        const monthDifference = targetMonth - currentMonth;
        const isSameMonth = monthDifference === CURRENT_MONTH;

        if (!isSameMonth) {
          const isSwitchToPreviousMonth =
            monthDifference === PREVIOUS_MONTH ||
            (currentMonth === JANUARY && targetMonth === DECEMBER);
          const isSwitchToNextMonth =
            monthDifference === NEXT_MONTH ||
            (currentMonth === DECEMBER && targetMonth === JANUARY);

          if (isSwitchToPreviousMonth) {
            updateMonth(PREVIOUS_MONTH);
          } else if (isSwitchToNextMonth) {
            updateMonth(NEXT_MONTH);
          }
        }

        if (isLongPressActive.current) {
          selectedCount.current++;

          switch (selectedCount.current) {
            case 1:
              setDateRange({ from: newDateCopy });
              break;
            case 2:
              setDateRange(prevRange => ({ ...prevRange, to: newDateCopy }));
              setLongPressActive(false);
              selectedCount.current = 0;
              break;
          }
        }
      }

      setDate(prevDate => ({
        ...prevDate,
        userSelectedDate: newDateCopy,
      }));

      if (zoomLevel !== level) {
        setAnimationDirection('zoomIn');
        setZoomLevel(level);
      }
    },
  );

  const handleLongPress = useLastCallback(() => {
    setLongPressActive(!isDisabledSelectionRange);
  });

  const handleMouseOver = useLastCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabledSelectionRange) return;

      e.preventDefault();
      const target = e.target as HTMLElement | null;

      const hasRangeEnd = !!dateRange?.to;

      if (target && !hasRangeEnd) {
        requestMeasure(() => {
          const column = Math.floor(target.offsetLeft / CELL_SIZE);
          const row = Math.floor(target.offsetTop / CELL_SIZE);

          setGridPosition({
            columns: column,
            rows: row,
          });
        });
      }
    }, 100), // 10 calls per second
  );

  const shouldMouseOver = isLongPressActive.current ? handleMouseOver : undefined;

  const handleSwitchZoom = useLastCallback(() => {
    setAnimationDirection('zoomIn');
    setZoomLevel(prev => LEVELS[(prev + 1) % LEVELS.length]);
  });

  const CalendarView = CALENDAR_VIEWS[zoomLevel];

  const { className, style } = useCalendarStyles(zoomLevel, CELL_SIZE);

  return (
    <div data-mode={mode} className="datePicker" style={style}>
      <DatePickerNavigation
        month={date.currentSystemDate.toLocaleString('default', { month: 'long' })}
        year={date.currentSystemDate.getFullYear()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onZoomToggle={handleSwitchZoom}
      />
      <WeekdayLabels formatMessage={formatMessage} />

      <div ref={gridRef} className="gridWrapper" onMouseOver={shouldMouseOver}>
        <TransitionGroup
          component={null}
          childFactory={(child: ReactElement<CSSTransitionProps<HTMLDivElement>>) =>
            cloneElement(child, {
              classNames: direction.current, // LTR or RTL
              timeout: TRANSITION_DURATION,
            })
          }
        >
          <CSSTransition key={transitionKey} nodeRef={nodeRef} timeout={TRANSITION_DURATION}>
            <div ref={nodeRef} className={className}>
              <CalendarView
                date={date}
                onSelectDate={handleSelectDate}
                onLongPressStart={handleLongPress}
              />
            </div>
          </CSSTransition>
        </TransitionGroup>

        <div
          className="calendarSelectorMask"
          style={{
            display: isDisabledSelectionRange ? 'none' : undefined,
            clipPath: clipPathValue,
          }}
        ></div>
        <LightEffect gridRef={gridRef} lightSize={LIGHT_SIZE} />
      </div>
    </div>
  );
};

export default memo(DatePicker);
