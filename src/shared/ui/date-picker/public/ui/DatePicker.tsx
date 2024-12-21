import { FC, useMemo, useRef, cloneElement, createRef, useState, memo, ReactElement } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useIntl } from 'react-intl';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { throttle } from '@/lib/utils/schedulers';
import buildClassName from '@/shared/lib/buildClassName';
import buildStyle from '@/shared/lib/buildStyle';

import { DateRangeData, ISelectDate } from '../../private/lib/types';
import {
  CELL_SIZE,
  ZoomLevel,
  TRANSITION_DURATION,
  COLUMNS,
  MAX_DATE_CELLS,
  CURRENT_MONTH,
  DECEMBER,
  JANUARY,
  NEXT_MONTH,
  PREVIOUS_MONTH,
} from '../../private/lib/constans';

import {
  WeekView,
  MonthView,
  YearView,
  DatePickerNavigation,
  WeekdayLabels,
} from '../../private/ui';

import './DatePicker.scss';
import calculateGridSelection from '../../private/lib/helpers/calculateGridSelection';
import { CSSTransitionProps } from 'react-transition-group/CSSTransition';
import { createSignal } from '@/lib/modules/signals';

import { initGrigPosition, initDateRange } from './config';
import useSelectedOrCurrentDate from '../../private/lib/hooks/useSelectedOrCurrentDate';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';
import useClipPathForDateRange from '../../private/lib/hooks/useClipPathForDateRange';

type Mode = 'future' | 'past' | 'all';

type AnimationType = 'LTR' | 'RTL' | 'zoomIn' | 'zoomOut';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerProps {
  selectedAt?: number;
  minAt?: number;
  maxAt?: number;
  mode?: Mode;
}

// const calculateIsDisabled = (
//   isFutureMode: boolean,
//   isPastMode: boolean,
//   minDate: Date | null,
//   maxDate: Date | null,
//   selectedDate: Date,
// ) => {
//   return (isFutureMode && selectedDate < minDate!) || (isPastMode && selectedDate > maxDate!);
// };

// const calculateClipPathValue = (
//   dateRange: DateRange,
//   gridPosition: { rows: number; columns: number },
// ) => {
//   if (!dateRange.from) return 'none';
//   const startIndex = 0;
//   const lastIndex = gridPosition.rows * COLUMNS + gridPosition.columns + 1;
//   return calculateGridSelection(startIndex, lastIndex);
// };

const LEVELS = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR];

const [isLongPressActive, setLongPressActive] = createSignal(false);

const DatePicker: FC<DatePickerProps> = ({ selectedAt, minAt, maxAt, mode }) => {
  const { formatMessage } = useIntl();
  const initSelectedDate = useSelectedOrCurrentDate(selectedAt);

  const nodeRef = createRef<HTMLDivElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<AnimationType>('LTR');
  const selectedCountRef = useRef(0);

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);
  const [gridPosition, setGridPosition] = useState(initGrigPosition);
  const [dateRange, setDateRange] = useState<DateRange>(initDateRange);

  // current is for display on grid and second for user selection
  const [date, setDate] = useState<DateRangeData>({
    currentSystemDate: initSelectedDate,
    userSelectedDate: initSelectedDate,
  });

  const clipPathValue = useClipPathForDateRange(dateRange, gridPosition);

  const handlePrevMonth = useLastCallback(() => updateMonth(PREVIOUS_MONTH));
  const handleNextMonth = useLastCallback(() => updateMonth(NEXT_MONTH));

  const setAnimationDirection = useLastCallback((direction: AnimationType) => {
    directionRef.current = direction;
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

      const currentMonth = date.currentSystemDate.getMonth();
      const targetMonth = newDateCopy.getMonth();

      const monthDifference = targetMonth - currentMonth;
      const isSameMonth = monthDifference === CURRENT_MONTH;

      if (!isSameMonth) {
        const isSwitchToPreviousMonth =
          monthDifference === PREVIOUS_MONTH ||
          (currentMonth === JANUARY && targetMonth === DECEMBER);
        const isSwitchToNextMonth =
          monthDifference === NEXT_MONTH || (currentMonth === DECEMBER && targetMonth === JANUARY);

        if (isSwitchToPreviousMonth) {
          updateMonth(PREVIOUS_MONTH);
        } else if (isSwitchToNextMonth) {
          updateMonth(NEXT_MONTH);
        }
      }

      if (isLongPressActive()) {
        selectedCountRef.current++;

        switch (selectedCountRef.current) {
          case 1:
            setDateRange({ from: newDateCopy });
            break;
          case 2:
            setDateRange(prevRange => ({ ...prevRange, to: newDateCopy }));
            setLongPressActive(false);
            selectedCountRef.current = 0;
            break;
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
    setLongPressActive(true);
  });

  const handleMouseOver = useLastCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleSwitchZoom = useLastCallback(() => {
    setAnimationDirection('zoomIn');
    setZoomLevel(prev => LEVELS[(prev + 1) % LEVELS.length]);
  });

  const CalendarView = useMemo(() => {
    switch (zoomLevel) {
      case ZoomLevel.WEEK:
        return WeekView;
      case ZoomLevel.MONTH:
        return MonthView;
      case ZoomLevel.YEAR:
        return YearView;
    }
  }, [zoomLevel]);

  const className = useMemo(
    () => buildClassName('calendarGrid', `${ZoomLevel[zoomLevel].toLowerCase()}View`),
    [zoomLevel],
  );
  const style = useMemo(() => buildStyle(`--cell-size: ${CELL_SIZE}px`), [CELL_SIZE]);

  const transitionKey = useMemo(
    () =>
      directionRef.current === 'zoomIn'
        ? Number(zoomLevel) * 2
        : date.currentSystemDate.getTime().toString(),
    [zoomLevel, date],
  );

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

      <div
        ref={gridRef}
        className="gridWrapper"
        onMouseOver={isLongPressActive() ? handleMouseOver : undefined}
      >
        <TransitionGroup
          component={null}
          childFactory={(child: ReactElement<CSSTransitionProps<HTMLDivElement>>) =>
            cloneElement(child, {
              classNames: directionRef.current, // LTR or RTL
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

        <div className="calendarSelectorMask" style={{ clipPath: clipPathValue }}></div>
        {/* <LightEffect gridRef={gridRef} lightSize={LIGHT_SIZE} /> */}
      </div>
    </div>
  );
};

// if(!bFirstOverRef.current) {
//   bFirstOverRef.current = false;
// } else {
//   trackCursor(target, () => {
//     close()
//   });
// }

// Bad idea here, but needs to be moved to its own date picker component
// const trackCursor = (e: HTMLDivElement, callback: NoneToVoidFunction) => {

// }

function getDayIndexInMonth(date = new Date()) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() || 7;
  const currentDay = date.getDate();

  const firstDayIndex = firstDayOfMonth;

  return (currentDay + firstDayIndex - 1) % MAX_DATE_CELLS;
}

export default memo(DatePicker);
