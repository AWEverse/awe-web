import {
  FC,
  useRef,
  cloneElement,
  createRef,
  useState,
  memo,
  ReactElement,
  ReactNode,
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useIntl } from "react-intl";
import { useStableCallback } from "@/shared/hooks/base";
import { throttle } from "@/lib/core";

import {
  CalendarAnimationType,
  CalendarMode,
  DateRangeData,
  ISelectDate,
} from "../../private/lib/types";
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
} from "../../private/lib/constans";

import {
  WeekView,
  MonthView,
  YearView,
  DatePickerNavigation,
  WeekdayLabels,
} from "../../private/ui";

import "./DatePicker.scss";
import { CSSTransitionProps } from "react-transition-group/CSSTransition";

import { initGrigPosition, initDateRange } from "./config";
import useSelectedOrCurrentDate from "../../private/lib/hooks/useSelectedOrCurrentDate";
import { requestMeasure } from "@/lib/modules/fastdom";
import useClipPathForDateRange from "../../private/lib/hooks/useClipPathForDateRange";
import useTransitionKey from "../../private/lib/hooks/useTransitionKey";
import useCalendarStyles from "../../private/lib/hooks/useCalendarStyles";
import LightEffect from "@/shared/ui/common/LightEffect";
import useDateBoundary from "../../private/lib/hooks/useDateBoundary";
import useIsDateDisabled from "../../private/lib/hooks/useIsDateDisabled";

interface OwnProps {
  className?: string; // Custom class name for styling
  disabled?: boolean; // Whether the date picker is disabled
  label?: string; // Label text for the picker
  locale?: string; // Locale for date formatting
  minAt?: Date; // Minimum allowed date
  maxAt?: Date; // Maximum allowed date
  mode?: CalendarMode; // Mode for the picker (single date or range)
  onChange?: (selectedDate: Date) => void; // Callback for when the date changes
  onClear?: () => void; // Callback for when the date is cleared
  placeholder?: ReactNode; // Placeholder text for the input field
  readonly?: boolean; // Whether the picker is read-only
  range?: boolean; // Whether the picker is in range mode
  selectedAt?: number; // The currently selected date
  size?: "small" | "medium" | "large";
}

const LEVELS = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR];

const CALENDAR_VIEWS = {
  [ZoomLevel.WEEK]: WeekView,
  [ZoomLevel.MONTH]: MonthView,
  [ZoomLevel.YEAR]: YearView,
};

/*
this string templte is used for copy calendar and move into a chat for example
with all entities (own dates, selected dates, current month, selected range and so on)

25 26 27 28 29 30 [1
2  3  4  5  6  7  8
9  10 (11 (12) 13 14 15
16 17 18 19 (20 21 22
23 24 25 26 27)) 28 29
30 31] 1  2  3  4  5

Understanding the fact that the sequence in the calendar is iterative,
it can be noted that the line can be reduced by an order of magnitude.

this: 25 30 [1 (11 (12) (20 27)) 31] 1 5

() - selected range
[] - current month

1) have already function that can find all substrings in brackets
2)

(11 (12) 13 14 15 16 17 18 19 (20 21 22 23 24 25 26 27))'
*/

const DatePicker: FC<OwnProps> = ({
  className,
  disabled,
  label,
  locale,
  minAt,
  maxAt,
  selectedAt,
  mode = "all",
  onChange,
  onClear,
  placeholder,
  readonly,
  range,
  size,
}) => {
  const { formatMessage } = useIntl();
  const initSelectedDate = useSelectedOrCurrentDate(selectedAt);

  const nodeRef = createRef<HTMLDivElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const direction = useRef<CalendarAnimationType>("LTR");
  const selectedCount = useRef(0);
  const isLongPressActive = useRef<boolean>(false);

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);
  const [gridPosition, setGridPosition] = useState(initGrigPosition);

  // current is for display on grid and second for user selection
  const [date, setDate] = useState<DateRangeData>({
    currentSystemDate: initSelectedDate,
    userSelectedDate: initSelectedDate,
    dateRange: initDateRange,
  });

  const canActivateSelect = date.dateRange.from && !date.dateRange.to;

  const isDisabledSelectionRange = zoomLevel !== ZoomLevel.WEEK;

  const { minDate, maxDate, isMinInFuture, isMaxInPast } = useDateBoundary({
    isFutureMode: mode === "future",
    isPastMode: mode === "past",
    minAt,
    maxAt,
  });

  const isDisabled =
    useIsDateDisabled({
      selectedDate: date.userSelectedDate,
      isFutureMode: mode === "future",
      isPastMode: mode === "past",
      minDate,
      maxDate,
    }) && !disabled;

  const clipPathValue = useClipPathForDateRange(
    date.dateRange,
    gridPosition,
    isDisabledSelectionRange,
  );
  const transitionKey = useTransitionKey(
    direction,
    zoomLevel,
    date.currentSystemDate,
  );

  const handlePrevMonth = useStableCallback(() => updateMonth(PREVIOUS_MONTH));
  const handleNextMonth = useStableCallback(() => updateMonth(NEXT_MONTH));

  const setAnimationDirection = useStableCallback(
    (_direction: CalendarAnimationType) => {
      direction.current = _direction;
    },
  );

  const setLongPressActive = useStableCallback((value?: boolean) => {
    isLongPressActive.current = value ?? !isLongPressActive.current;
  });

  const updateMonth = useStableCallback((increment: number) => {
    setAnimationDirection(increment > 0 ? "RTL" : "LTR");

    setDate((p) => {
      const currentSystemDateCopy = new Date(p.currentSystemDate);
      currentSystemDateCopy.setDate(1);
      currentSystemDateCopy.setMonth(
        currentSystemDateCopy.getMonth() + increment,
      );

      if (isNaN(currentSystemDateCopy.getTime())) {
        return p;
      }

      if (minAt && currentSystemDateCopy < new Date(minAt)) {
        return p;
      }

      if (maxAt && currentSystemDateCopy > new Date(maxAt)) {
        return p;
      }

      onChange?.(date.userSelectedDate);

      return { ...p, currentSystemDate: currentSystemDateCopy };
    });
  });

  const handleSelectDate = useStableCallback(
    ({ day = 1, month = 0, year = 0, level = zoomLevel }: ISelectDate = {}) => {
      const newDateCopy = new Date(year, month, day);

      if (minAt && newDateCopy < new Date(minAt)) {
        return;
      }

      if (maxAt && newDateCopy > new Date(maxAt)) {
        return;
      }

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
              setDate((p) => ({ ...p, dateRange: { from: newDateCopy } }));
              break;
            case 2:
              setDate((p) => ({
                ...p,
                dateRange: { ...p.dateRange, to: newDateCopy },
              }));
              setLongPressActive(false);
              selectedCount.current = 0;
              break;
          }
        }
      }

      setDate((p) => ({
        ...p,
        userSelectedDate: newDateCopy,
      }));

      if (zoomLevel !== level) {
        setAnimationDirection("zoomIn");
        setZoomLevel(level);
      }
    },
  );

  const handleLongPress = useStableCallback(() => {
    setLongPressActive(!isDisabledSelectionRange);
  });

  const handleMouseOver = useStableCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabledSelectionRange) return;

      e.preventDefault();
      const target = e.target as HTMLElement | null;

      const hasRangeEnd = !!date.dateRange?.to;

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

  const shouldMouseOver = isLongPressActive.current
    ? handleMouseOver
    : undefined;

  const handleSwitchZoom = useStableCallback(() => {
    setAnimationDirection("zoomIn");
    setZoomLevel((prev) => LEVELS[(prev + 1) % LEVELS.length]);
  });

  const CalendarView = CALENDAR_VIEWS[zoomLevel];

  const { classNames, style } = useCalendarStyles(
    className,
    zoomLevel,
    CELL_SIZE,
  );

  return (
    <div
      data-activity={!isDisabled ? "Active" : "Disabled"}
      data-mode={mode}
      className="datePicker"
      style={style}
    >
      <DatePickerNavigation
        month={date.currentSystemDate.toLocaleString("default", {
          month: "long",
        })}
        year={date.currentSystemDate.getFullYear()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onZoomToggle={handleSwitchZoom}
      />
      <WeekdayLabels formatMessage={formatMessage} />
      <hr />
      <section
        aria-label="Date picker"
        ref={gridRef}
        className="gridWrapper"
        onMouseOver={shouldMouseOver}
      >
        <TransitionGroup
          component={null}
          childFactory={(
            child: ReactElement<CSSTransitionProps<HTMLDivElement>>,
          ) =>
            cloneElement(child, {
              classNames: direction.current, // LTR or RTL
              timeout: TRANSITION_DURATION,
            })
          }
        >
          <CSSTransition
            key={transitionKey}
            nodeRef={nodeRef}
            timeout={TRANSITION_DURATION}
          >
            <div ref={nodeRef} className={classNames}>
              <CalendarView
                date={date}
                mode={mode}
                onSelectDate={handleSelectDate}
                onLongPressStart={handleLongPress}
              />
            </div>
          </CSSTransition>
        </TransitionGroup>
        <div
          data-visible={canActivateSelect}
          className="calendarSelectorMask"
          style={{
            clipPath: clipPathValue,
          }}
        ></div>
        <LightEffect gridRef={gridRef} lightSize={LIGHT_SIZE} />
      </section>
      {placeholder && <section>{placeholder}</section>}
    </div>
  );
};

export default memo(DatePicker);
