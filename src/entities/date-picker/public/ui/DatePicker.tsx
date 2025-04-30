import { FC, useRef, useState, memo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStableCallback } from "@/shared/hooks/base";
import { IS_MOBILE, throttle } from "@/lib/core";

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
import useCalendarStyles from "../../private/lib/hooks/useCalendarStyles";

import "./DatePicker.scss";
import useCalendar from "../../private/lib/hooks/useCalendar";
import { useGridSelection } from "../../private/lib/hooks/useGridSelection";
import useGridInteraction from "../../private/lib/hooks/useGridInteraction";

const animationVariants = {
  slide: {
    initial: (animated: CalendarAnimationType) => ({
      x: animated === "RTL" ? "100%" : animated === "LTR" ? "-100%" : 0,
      opacity: 1,
      scale: 0.95,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    exit: (animated: CalendarAnimationType) =>
      animated === "zoom"
        ? {
            scale: 0.8,
            opacity: 0,
            y: -20,
            transition: { duration: 0.25, ease: "easeInOut" },
          }
        : {
            x: animated === "RTL" ? "-100%" : "100%",
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
    exit: (animated: CalendarAnimationType) =>
      animated === "zoom"
        ? {
            scale: 0.8,
            opacity: 0,
            y: -20,
            transition: { duration: 0.25, ease: "easeInOut" },
          }
        : {
            x: animated === "RTL" ? "-100%" : "100%",
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeInOut" },
          },
  },
};

const getActiveVariants = (animated: CalendarAnimationType) =>
  animated === "zoom" ? animationVariants.zoom : animationVariants.slide;

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

  const {
    animated,
    setAnimated,
    dateState,
    changeMonth,
    handleDateSelect,
    handleUndo,
    handleRedo,
  } = useCalendar(initialDate, minAt, maxAt);

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
    setAnimated("zoom");
    setZoomLevel(
      ZOOM_LEVELS[(ZOOM_LEVELS.indexOf(zoomLevel) + 1) % ZOOM_LEVELS.length],
    );
  });

  const transitionKey = `${dateState.currentSystemDate.getMonth()}-${zoomLevel}`;

  const { path, labelPath, count } = useGridSelection(
    { start: 10, end: 23 },
    {
      cellSize: 46,
      columns: 7,
      rows: 6,
      orientation: "horizontal",
    },
  );

  const { handleMouseMove, handleTouchMove } = useGridInteraction(gridRef);

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
        onTouchMove={handleTouchMove}
        className={`dp-grid-wrapper dp-spotlight ${classNames}`}
      >
        <AnimatePresence initial={false} custom={animated} mode="popLayout">
          <motion.div
            key={transitionKey}
            className={classNames}
            variants={getActiveVariants(animated)}
            custom={animated}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleSelectDate}
          >
            {((ViewComponent) => (
              <ViewComponent date={dateState} mode={mode} />
            ))(CALENDAR_VIEWS[zoomLevel])}
          </motion.div>
        </AnimatePresence>

        <svg width="100%" height="100%" className="dp-selector-mask">
          <defs>
            <path id="label-path" d={labelPath} />
          </defs>

          <path
            d={path}
            fill="rgba(0, 128, 255, 0.1)"
            stroke="#007aff"
            strokeWidth={2}
            strokeDasharray="4"
            strokeDashoffset="8"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="8"
              to="0"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </section>

      {placeholder && (
        <section className="dp-placeholder">{placeholder}</section>
      )}
    </div>
  );
};

export default memo(DatePicker);
