import { FC, useRef, useState, memo, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStableCallback } from "@/shared/hooks/base";

import { CalendarAnimationType, CalendarMode } from "../../private/lib/types";
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
import useClipPathForDateRange from "../../private/lib/hooks/useClipPathForDateRange";
import useCalendarStyles from "../../private/lib/hooks/useCalendarStyles";

import "./DatePicker.scss";
import { initGridPosition } from "./config";
import useDateSelection from "../../private/lib/hooks/useDateSelection";

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
      direction === "zoomIn"
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
      direction === "zoomIn"
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
  direction === "zoomIn" ? animationVariants.zoom : animationVariants.slide;

// Calendar View Configuration
const ZOOM_LEVELS = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR] as const;
const CALENDAR_VIEWS = {
  [ZoomLevel.WEEK]: WeekView,
  [ZoomLevel.MONTH]: MonthView,
  [ZoomLevel.YEAR]: YearView,
} as const;

// Types
interface DatePickerProps {
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

// Animation Control Hook
const useAnimationControl = () => {
  const [direction, setDirection] = useState<CalendarAnimationType>("LTR");

  const updateDirection = useStableCallback(
    (newDirection: CalendarAnimationType) => {
      setDirection(newDirection);
    },
  );

  return { direction, updateDirection };
};

// Main DatePicker Component
const DatePicker: FC<DatePickerProps> = ({
  className,
  disabled = false,
  label,
  locale = "default",
  minAt,
  maxAt,
  mode = "all",
  onChange,
  // onClear,
  placeholder,
  // readonly = false,
  // range = false,
  selectedAt,
  // size,
}) => {
  const initialDate = useSelectedOrCurrentDate(selectedAt);
  const gridRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);

  const { direction, updateDirection } = useAnimationControl();
  const { date, setDate, handleSelectDate, handleLongPress, handleMouseOver } =
    useDateSelection({
      initialDate,
      onChange,
      changeMonth: (increment) => changeMonth(increment),
      isRangeSelectionDisabled: zoomLevel !== ZoomLevel.WEEK,
      minAt,
      maxAt,
    });

  const { classNames, style } = useCalendarStyles(
    className,
    zoomLevel,
    CELL_SIZE,
  );
  const canActivateSelect = Boolean(date.dateRange.from && !date.dateRange.to);
  const clipPathValue = useClipPathForDateRange(
    date.dateRange,
    initGridPosition, // Fixed from previous oversight
    zoomLevel !== ZoomLevel.WEEK,
  );

  const changeMonth = useStableCallback((increment: number) => {
    updateDirection(increment > 0 ? "RTL" : "LTR");
    setDate((prev) => {
      const newSystemDate = new Date(prev.currentSystemDate);
      newSystemDate.setDate(1);
      newSystemDate.setMonth(newSystemDate.getMonth() + increment);

      if (
        isNaN(newSystemDate.getTime()) ||
        (minAt && newSystemDate < minAt) ||
        (maxAt && newSystemDate > maxAt)
      ) {
        return prev;
      }
      return { ...prev, currentSystemDate: newSystemDate };
    });
  });

  const handlePrevMonth = () => changeMonth(PREVIOUS_MONTH);
  const handleNextMonth = () => changeMonth(NEXT_MONTH);
  const handleSwitchZoom = () => {
    updateDirection("zoomIn");
    setZoomLevel(
      (prev) =>
        ZOOM_LEVELS[(ZOOM_LEVELS.indexOf(prev) + 1) % ZOOM_LEVELS.length],
    );
  };

  const CalendarView = CALENDAR_VIEWS[zoomLevel];
  const transitionKey = `${date.currentSystemDate.getMonth()}-${zoomLevel}`;

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gridRef.current.style.setProperty("--mouse-x", `${x}px`);
    gridRef.current.style.setProperty("--mouse-y", `${y}px`);
    gridRef.current.style.setProperty(
      "--spotlight-color",
      "rgba(255, 255, 255, 0.25)",
    );
  };

  return (
    <div
      className="dp-container"
      style={style}
      data-activity={disabled ? "Disabled" : "Active"}
      data-mode={mode}
    >
      {label && <label className="dp-label">{label}</label>}
      <DatePickerNavigation
        month={date.currentSystemDate.toLocaleString(locale, { month: "long" })}
        year={date.currentSystemDate.getFullYear()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onZoomToggle={handleSwitchZoom}
      />
      <WeekdayLabels />
      <hr className="dp-divider" />
      <section
        ref={gridRef}
        aria-label="Date picker"
        onMouseOver={handleMouseOver}
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
          className="dp-selector-mask"
          data-visible={canActivateSelect}
          style={{ clipPath: clipPathValue }}
        />
      </section>
      {placeholder && (
        <section className="dp-placeholder">{placeholder}</section>
      )}
    </div>
  );
};

export default memo(DatePicker);
