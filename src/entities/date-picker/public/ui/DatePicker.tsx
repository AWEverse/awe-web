import { FC, useRef, useState, memo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStableCallback } from "@/shared/hooks/base";
import { throttle } from "@/lib/core";

import {
  CalendarAnimationType,
  CalendarMode,
  DateState,
  EDatePickerView,
} from "../../private/lib/types";
import {
  CELL_SIZE,
  ZoomLevel,
  NEXT_MONTH,
  PREVIOUS_MONTH,
} from "../../private/lib/constans";
import {
  WeekView,
  MonthView,
  YearView,
  DatePickerNavigation,
  WeekdayLabels,
} from "../../private/ui";
import useSelectedOrCurrentDate from "../../private/lib/hooks/useSelectedOrCurrentDate";
import useCalendarStyles from "../../private/lib/hooks/useCalendarStyles";

import "./DatePicker.scss";
import useCalendar from "../../private/lib/hooks/useCalendar";

const animationVariants = {
  slide: {
    initial: (direction: CalendarAnimationType) => ({
      x: direction === "RTL" ? "100%" : direction === "LTR" ? "-100%" : 0,
      opacity: 1,
      scale: 0.95,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    exit: (direction: CalendarAnimationType) =>
      direction === "zoom"
        ? {
            scale: 0.8,
            opacity: 0,
            y: -20,
            transition: { duration: 0.25, ease: "easeInOut" },
          }
        : {
            x: direction === "RTL" ? "-100%" : "100%",
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeInOut" },
          },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0, y: 20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeInOut" },
    },
    exit: (direction: CalendarAnimationType) =>
      direction === "zoom"
        ? {
            scale: 0.8,
            opacity: 0,
            y: -20,
            transition: { duration: 0.25, ease: "easeInOut" },
          }
        : {
            x: direction === "RTL" ? "-100%" : "100%",
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeInOut" },
          },
  },
};

const getActiveVariants = (direction: CalendarAnimationType) =>
  direction === "zoom" ? animationVariants.zoom : animationVariants.slide;

const ZOOM_LEVELS = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR] as const;

const CALENDAR_VIEWS = {
  [ZoomLevel.WEEK]: WeekView,
  [ZoomLevel.MONTH]: MonthView,
  [ZoomLevel.YEAR]: YearView,
} as const;

interface DatePickerProps {
  className?: string;
  disabled?: boolean;
  label?: string;
  locale?: string;
  minAt?: Date;
  maxAt?: Date;
  mode?: CalendarMode;
  onChange?: (userSelectedDate: Date) => void;
  placeholder?: ReactNode;
  selectedAt?: number;
}

const DatePicker: FC<DatePickerProps> = ({
  className,
  disabled = false,
  label,
  locale = "default",
  minAt,
  maxAt,
  mode = "all",
  onChange,
  placeholder,
  selectedAt,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);
  const initialDate = selectedAt ? new Date(selectedAt) : new Date();

  const { dateState, changeMonth, handleDateSelect, handleUndo, handleRedo } =
    useCalendar(initialDate, minAt, maxAt);

  const [direction, setDirection] = useState<CalendarAnimationType>("LTR");

  const { classNames, style } = useCalendarStyles(
    className,
    zoomLevel,
    CELL_SIZE,
  );

  const isDateValid = (date: Date): boolean => {
    if (minAt && date < minAt) return false;
    if (maxAt && date > maxAt) return false;
    return true;
  };

  const handleSelectDate = useStableCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const target = event.target as HTMLElement;
      const dateAttr = target.dataset.isodate;

      if (!dateAttr) return;

      const selectedDate = new Date(dateAttr);
      if (!isDateValid(selectedDate)) return;

      if (direction) {
        setDirection(direction);
      }

      const adjustedDay = selectedDate.getDate() + 1;
      handleDateSelect(
        adjustedDay,
        selectedDate.getMonth(),
        selectedDate.getFullYear(),
      );
    },
  );

  const handlePrevMonth = useStableCallback(() => changeMonth(PREVIOUS_MONTH));
  const handleNextMonth = useStableCallback(() => changeMonth(NEXT_MONTH));
  const handleZoomToggle = useStableCallback(() => {
    setDirection("zoom");
    setZoomLevel(
      ZOOM_LEVELS[(ZOOM_LEVELS.indexOf(zoomLevel) + 1) % ZOOM_LEVELS.length],
    );
  });

  const CalendarView = CALENDAR_VIEWS[zoomLevel];
  const transitionKey = `${dateState.currentSystemDate.getMonth()}-${zoomLevel}`;

  const handleMouseMove = useStableCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
      const grid = gridRef.current;
      if (!grid) return;

      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      grid.style.setProperty("--mouse-x", `${x}px`);
      grid.style.setProperty("--mouse-y", `${y}px`);
    }, 16),
  );

  return (
    <div
      className="dp-container"
      style={style}
      data-activity={disabled ? "Disabled" : "Active"}
      data-mode={mode}
    >
      {label && <label className="dp-label">{label}</label>}

      <DatePickerNavigation
        month={dateState.currentSystemDate.toLocaleString(locale, {
          month: "long",
        })}
        year={dateState.currentSystemDate.getFullYear()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onZoomToggle={handleZoomToggle}
      />

      <WeekdayLabels />
      <hr className="dp-divider" />
      <section
        ref={gridRef}
        aria-label="Date picker"
        role="grid"
        onMouseMove={handleMouseMove}
        className={`dp-grid-wrapper dp-spotlight ${classNames}`}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={transitionKey}
            className={classNames}
            variants={getActiveVariants(direction)}
            custom={direction}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleSelectDate}
          >
            <CalendarView date={dateState} mode={mode} />
          </motion.div>
        </AnimatePresence>
      </section>
      {placeholder && (
        <section className="dp-placeholder">{placeholder}</section>
      )}
    </div>
  );
};

export default memo(DatePicker);
