import { FC, useRef, useState, memo, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { initGridPosition, initDateRange } from "./config";
import useSelectedOrCurrentDate from "../../private/lib/hooks/useSelectedOrCurrentDate";
import { requestMeasure } from "@/lib/modules/fastdom";
import useClipPathForDateRange from "../../private/lib/hooks/useClipPathForDateRange";
import useCalendarStyles from "../../private/lib/hooks/useCalendarStyles";
import LightEffect from "@/shared/ui/common/LightEffect";
import useDateBoundary from "../../private/lib/hooks/useDateBoundary";
import useIsDateDisabled from "../../private/lib/hooks/useIsDateDisabled";

export const TRANSITION_DURATION = 0.2;

interface OwnProps {
  className?: string;
  disabled?: boolean;
  label?: string;
  locale?: string;
  minAt?: Date;
  maxAt?: Date;
  mode?: CalendarMode;
  onChange?: (selectedDate: Date) => void;
  onClear?: () => void;
  placeholder?: ReactNode;
  readonly?: boolean;
  range?: boolean;
  selectedAt?: number;
  size?: "small" | "medium" | "large";
}

const LEVELS = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR];

const CALENDAR_VIEWS = {
  [ZoomLevel.WEEK]: WeekView,
  [ZoomLevel.MONTH]: MonthView,
  [ZoomLevel.YEAR]: YearView,
};

const animationVariants = {
  initial: (direction: CalendarAnimationType) => ({
    x: direction === "RTL" ? "100%" : direction === "LTR" ? "-100%" : 0,
    opacity: direction === "zoomIn" ? 0 : 1,
    scale: direction === "zoomIn" ? 0.8 : 0.95,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: TRANSITION_DURATION, ease: "easeInOut" },
  },
  exit: (direction: CalendarAnimationType) => ({
    x: direction === "RTL" ? "-100%" : "100%",
    opacity: 0,
    scale: 0.95,
    transition: { duration: TRANSITION_DURATION, ease: "easeInOut" },
  }),
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: TRANSITION_DURATION, ease: "easeInOut" },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: TRANSITION_DURATION, ease: "easeInOut" },
    },
  },
};

const getActiveVariants = (direction: CalendarAnimationType) => {
  if (direction === "zoomIn") {
    return animationVariants.zoom;
  }
  return {
    initial: animationVariants.initial(direction),
    animate: animationVariants.animate,
    exit: animationVariants.exit(direction),
  };
};

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

  const gridRef = useRef<HTMLDivElement>(null);
  // Use state for animation direction so changes trigger a re-render.
  const [animationDirection, setAnimationDirection] =
    useState<CalendarAnimationType>("LTR");
  const selectedCount = useRef(0);
  const isLongPressActive = useRef<boolean>(false);

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);
  const [gridPosition, setGridPosition] = useState(initGridPosition);
  const [date, setDate] = useState<DateRangeData>({
    currentSystemDate: initSelectedDate,
    userSelectedDate: initSelectedDate,
    dateRange: initDateRange,
  });

  const canActivateSelect = date.dateRange.from && !date.dateRange.to;
  const isDisabledSelectionRange = zoomLevel !== ZoomLevel.WEEK;

  const { minDate, maxDate } = useDateBoundary({
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

  const transitionKey = date.currentSystemDate.getMonth();

  const updateAnimationDirection = useStableCallback(
    (newDirection: CalendarAnimationType) => {
      setAnimationDirection(newDirection);
    },
  );

  const setLongPressActive = useStableCallback((value?: boolean) => {
    isLongPressActive.current = value ?? !isLongPressActive.current;
  });

  const updateMonth = useStableCallback((increment: number) => {
    updateAnimationDirection(increment > 0 ? "RTL" : "LTR");

    console.log(increment > 0 ? "RTL" : "LTR");

    setDate((prev) => {
      const newSystemDate = new Date(prev.currentSystemDate);
      newSystemDate.setDate(1);
      newSystemDate.setMonth(newSystemDate.getMonth() + increment);

      if (isNaN(newSystemDate.getTime())) return prev;
      if (minAt && newSystemDate < new Date(minAt)) return prev;
      if (maxAt && newSystemDate > new Date(maxAt)) return prev;

      onChange?.(prev.userSelectedDate);
      return { ...prev, currentSystemDate: newSystemDate };
    });
  });

  const handlePrevMonth = useStableCallback(() => updateMonth(PREVIOUS_MONTH));
  const handleNextMonth = useStableCallback(() => updateMonth(NEXT_MONTH));

  const handleSelectDate = useStableCallback(
    ({ day = 1, month = 0, year = 0, level = zoomLevel }: ISelectDate = {}) => {
      const newDateObj = new Date(year, month, day);
      if (minAt && newDateObj < new Date(minAt)) return;
      if (maxAt && newDateObj > new Date(maxAt)) return;

      if (!isDisabledSelectionRange) {
        const currentMonth = date.currentSystemDate.getMonth();
        const targetMonth = newDateObj.getMonth();
        const monthDifference = targetMonth - currentMonth;
        const isSameMonth = monthDifference === CURRENT_MONTH;

        if (!isSameMonth) {
          const isSwitchToPreviousMonth =
            monthDifference === PREVIOUS_MONTH ||
            (currentMonth === JANUARY && targetMonth === DECEMBER);
          const isSwitchToNextMonth =
            monthDifference === NEXT_MONTH ||
            (currentMonth === DECEMBER && targetMonth === JANUARY);

          if (isSwitchToPreviousMonth) updateMonth(PREVIOUS_MONTH);
          else if (isSwitchToNextMonth) updateMonth(NEXT_MONTH);
        }

        if (isLongPressActive.current) {
          selectedCount.current++;
          if (selectedCount.current === 1) {
            setDate((prev) => ({ ...prev, dateRange: { from: newDateObj } }));
          } else if (selectedCount.current === 2) {
            setDate((prev) => ({
              ...prev,
              dateRange: { ...prev.dateRange, to: newDateObj },
            }));
            setLongPressActive(false);
            selectedCount.current = 0;
          }
        }
      }

      setDate((prev) => ({
        ...prev,
        userSelectedDate: newDateObj,
      }));

      if (zoomLevel !== level) {
        updateAnimationDirection("zoomIn");
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
      if (target && !date.dateRange?.to) {
        requestMeasure(() => {
          const column = Math.floor(target.offsetLeft / CELL_SIZE);
          const row = Math.floor(target.offsetTop / CELL_SIZE);
          setGridPosition({ columns: column, rows: row });
        });
      }
    }, 100),
  );

  const shouldMouseOver = isLongPressActive.current
    ? handleMouseOver
    : undefined;

  const handleSwitchZoom = useStableCallback(() => {
    updateAnimationDirection("zoomIn");
    setZoomLevel((prev) => LEVELS[(prev + 1) % LEVELS.length]);
  });

  const CalendarView = CALENDAR_VIEWS[zoomLevel];
  const { classNames, style } = useCalendarStyles(
    className,
    zoomLevel,
    CELL_SIZE,
  );

  // Get the active animation variants based on the current animation direction.
  const activeVariants = getActiveVariants(animationDirection);

  return (
    <div
      data-activity={!isDisabled ? "Active" : "Disabled"}
      data-mode={mode}
      className="datePicker"
      style={style}
    >
      <DatePickerNavigation
        month={date.currentSystemDate.toLocaleString(locale || "default", {
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
        <AnimatePresence initial={false} custom={animationDirection}>
          <motion.div
            key={transitionKey}
            className={classNames}
            variants={activeVariants}
            custom={animationDirection}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CalendarView
              date={date}
              mode={mode}
              onSelectDate={handleSelectDate}
              onLongPressStart={handleLongPress}
            />
          </motion.div>
        </AnimatePresence>
        <div
          data-visible={canActivateSelect}
          className="calendarSelectorMask"
          style={{ clipPath: clipPathValue }}
        ></div>
      </section>
      {placeholder && <section>{placeholder}</section>}
    </div>
  );
};

export default memo(DatePicker);
