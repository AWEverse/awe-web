import {
  FC,
  useMemo,
  useRef,
  cloneElement,
  createRef,
  useState,
  memo,
  ReactElement,
  useEffect,
} from 'react';
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
import calculateGridSelection from '../../private/lib/helpers/calculateGridSelection';
import LightEffect from '@/shared/ui/common/LightEffect';
import { CSSTransitionClassNames, CSSTransitionProps } from 'react-transition-group/CSSTransition';
import { createSignal } from '@/lib/modules/signals';

type Mode = 'future' | 'past' | 'all';

type ChildType = ReactElement & { classNames: string };

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

const calculateIsDisabled = (
  isFutureMode: boolean,
  isPastMode: boolean,
  minDate: Date | null,
  maxDate: Date | null,
  selectedDate: Date,
) => {
  return (isFutureMode && selectedDate < minDate!) || (isPastMode && selectedDate > maxDate!);
};

const calculateClipPathValue = (
  dateRange: DateRange,
  gridPosition: { rows: number; columns: number },
) => {
  if (!dateRange.from) return 'none';
  const startIndex = 0;
  const lastIndex = gridPosition.rows * COLUMNS + gridPosition.columns + 1;
  return calculateGridSelection(startIndex, lastIndex);
};

let nLongPressCount = 0;

const trackLongPress = (max: number) => {
  nLongPressCount = (++nLongPressCount + 1) % max;
  console.log('nLongPressCount', nLongPressCount, nLongPressCount === 0);

  return nLongPressCount === 0;
};

// boolean-Signal-{variable name}
const [bSSelected, setSelected] = createSignal(false);

const DatePicker: FC<DatePickerProps> = ({ selectedAt, minAt, maxAt, mode }) => {
  const { formatMessage } = useIntl();
  const gridRef = useRef<HTMLDivElement>(null);

  const isFutureMode = mode === 'future';
  const isPastMode = mode === 'past';
  const passedSelectedDate = useMemo(() => new Date(selectedAt ?? Date.now()), [selectedAt]);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);

  const directionRef = useRef<'LTR' | 'RTL' | 'zoomIn' | 'zoomOut'>('LTR');

  const [gridPosition, setGridPosition] = useState({
    columns: 0,
    rows: 0,
  });
  const [dateRange, setDateRange] = useState<DateRange>({ from: passedSelectedDate });

  // current is for display on grid and second for user selection
  const [date, setDate] = useState<DateRangeData>({
    currentSystemDate: passedSelectedDate,
    userSelectedDate: passedSelectedDate,
  });

  const minDate = useMemo(() => (minAt ? new Date(minAt) : null), [minAt]);
  const maxDate = useMemo(() => (maxAt ? new Date(maxAt) : null), [maxAt]);
  const areDisabled = calculateIsDisabled(
    isFutureMode,
    isPastMode,
    minDate,
    maxDate,
    date.userSelectedDate,
  );

  const handlePrevMonth = useLastCallback(() => updateMonth(-1));
  const handleNextMonth = useLastCallback(() => updateMonth(1));

  const updateMonth = (increment: number) => {
    directionRef.current = increment > 0 ? 'RTL' : 'LTR';

    setDate(prevDate => {
      const newDate = new Date(prevDate.currentSystemDate);
      newDate.setMonth(newDate.getMonth() + increment);
      newDate.setDate(1);

      return { ...prevDate, currentSystemDate: newDate };
    });
  };

  const handleSelectDate = useLastCallback(
    ({
      day = 1,
      month = 0,
      year = date.userSelectedDate.getFullYear(),
      level = zoomLevel,
    }: ISelectDate = {}) => {
      const dateCopy = new Date(year, month, day);

      setDate(prevDate => {
        return {
          ...prevDate,
          userSelectedDate: dateCopy,
        };
      });

      if (zoomLevel !== level) {
        directionRef.current = 'zoomIn';

        setZoomLevel(level);
      }
    },
  );

  const handleLongPress = useLastCallback(() => {
    setDateRange({ from: date.userSelectedDate, to: undefined });
  });

  const clipPathValue = useMemo(() => {
    if (!dateRange.from) return 'none';

    const startIndex = 5;
    const lastIndex = gridPosition.rows * COLUMNS + gridPosition.columns + 1;

    return calculateGridSelection(startIndex, lastIndex);
  }, [gridPosition, dateRange]);

  const handleMouseOver = useLastCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;

      if (target && !dateRange?.to) {
        const column = Math.floor(target.offsetLeft / CELL_SIZE);
        const row = Math.floor(target.offsetTop / CELL_SIZE);

        setGridPosition({
          columns: column,
          rows: row,
        });
      }
    }, 100), // 10 calls per second
  );

  const handleSwitchZoom = useLastCallback(() => {
    const levels = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR];
    directionRef.current = 'zoomIn';

    setZoomLevel(prev => {
      const nextIndex = (prev + 1) % levels.length;
      return levels[nextIndex];
    });
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

  const nodeRef = createRef<HTMLDivElement>();

  const transitionKey = useMemo(
    () =>
      directionRef.current === 'zoomIn'
        ? Number(zoomLevel) * 2
        : date.currentSystemDate.getTime().toString(),
    [zoomLevel, date],
  );

  return (
    <div data-mode={mode} aria-disabled={areDisabled} className="datePicker" style={style}>
      <DatePickerNavigation
        month={date.currentSystemDate.toLocaleString('default', { month: 'long' })}
        year={date.currentSystemDate.getFullYear()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onZoomToggle={handleSwitchZoom}
      />
      <WeekdayLabels formatMessage={formatMessage} />

      <div ref={gridRef} className="gridWrapper" onMouseOver={handleMouseOver}>
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

export default memo(DatePicker);
