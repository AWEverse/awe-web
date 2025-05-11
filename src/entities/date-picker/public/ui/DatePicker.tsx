import { FC, useRef, useState, ReactNode, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import useCalendarStyles from "../../private/lib/hooks/useCalendarStyles";

import "./DatePicker.scss";
import useCalendar from "../../private/lib/hooks/useCalendar";
import { useRangeSelection } from "../../private/lib/hooks/useRangeSelection";
import { useGridIndices } from "../../private/lib/hooks/useGridIndices";
import { useKeyboardNavigation } from "../../private/lib/hooks/useKeyboardNavigation";
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
  placeholder?: ReactNode;
  selectedAt?: number;
  // Selection mode props
  selectionMode?: "basic" | "select";
  onSelectionModeChange?: (mode: "basic" | "select") => void;
  onRangeSelect?: (range: { start: Date; end: Date }) => void;
  // Allow controlling range externally
  selectedRange?: { start: Date | null; end: Date | null };
  onSelectedRangeChange?: (range: {
    start: Date | null;
    end: Date | null;
  }) => void;
}

const DatePicker: FC<DatePickerProps> = ({
  className,
  disabled = false,
  label,
  locale = "default",
  minAt,
  maxAt,
  mode = "all",
  placeholder,
  selectedAt,
  onRangeSelect,
  selectionMode: controlledMode,
  onSelectionModeChange,
  selectedRange: controlledRange,
  onSelectedRangeChange,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);

  const [internalMode, setInternalMode] = useState<"basic" | "select">("basic");
  const calendarMode = controlledMode ?? internalMode;
  const setCalendarMode = (newMode: "basic" | "select") => {
    setInternalMode(newMode);
    onSelectionModeChange?.(newMode);
  };

  const initialDate = selectedAt ? new Date(selectedAt) : new Date();
  const { animated, setAnimated, dateState, changeMonth, handleDateSelect } =
    useCalendar(initialDate, minAt, maxAt);

  const {
    range,
    isSelecting,
    startSelection,
    updateSelection,
    completeSelection,
    cancelSelection,
  } = useRangeSelection({
    onRangeSelect,
    onRangeChange: onSelectedRangeChange,
    initialRange: controlledRange,
    minDate: minAt,
    maxDate: maxAt,
  });

  const gridIndices = useGridIndices({
    range,
    referenceDate: dateState.currentSystemDate,
    gridSize: { columns: 7, rows: 6 },
  });

  useKeyboardNavigation({
    isEnabled: calendarMode === "select",
    onNavigate: (direction) => {},
    onSelect: () => {
      // Implement selection logic
    },
    onCancel: () => {
      cancelSelection();
      setCalendarMode("basic");
    },
  });

  const { classNames, style } = useCalendarStyles(
    className,
    zoomLevel,
    CELL_SIZE,
  );

  const getDateFromEvent = (
    event: React.MouseEvent | React.TouchEvent,
  ): Date | null => {
    const target = event.target as HTMLElement;
    const dateAttr = target.dataset.isodate;
    if (!dateAttr) return null;
    return new Date(dateAttr);
  };

  const handleSelectDate = useStableCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (calendarMode !== "basic") return;
      const selectedDate = getDateFromEvent(event);
      if (!selectedDate) return;

      handleDateSelect(
        selectedDate.getDate(),
        selectedDate.getMonth(),
        selectedDate.getFullYear(),
      );
    },
  );

  const handleCellDoubleClick = (event: React.MouseEvent) => {
    const selectedDate = getDateFromEvent(event);
    if (!selectedDate) return;

    setCalendarMode("select");
    startSelection(selectedDate);
  };

  const handleCellMouseOver = (event: React.MouseEvent) => {
    if (calendarMode !== "select") return;
    const hoveredDate = getDateFromEvent(event);
    if (hoveredDate) {
      updateSelection(hoveredDate);
    }
  };

  const handleCellClick = (event: React.MouseEvent) => {
    if (calendarMode !== "select") return;
    const clickedDate = getDateFromEvent(event);
    if (!clickedDate) return;

    if (!isSelecting || !range.start) {
      startSelection(clickedDate);
    } else {
      const result = completeSelection(clickedDate);
      if (result) {
        setCalendarMode("basic");
      }
    }
  };

  const gridSelection = (() => {
    const defaultConfig = {
      cellSize: CELL_SIZE,
      columns: 7,
      rows: 6,
      orientation: "horizontal" as const,
    };

    if (!gridIndices) {
      return useGridSelection({ start: -1, end: -1 }, defaultConfig);
    }

    return useGridSelection(
      {
        start: Math.min(gridIndices.start, gridIndices.end - 1),
        end: Math.max(gridIndices.start, gridIndices.end - 1),
      },
      defaultConfig,
    );
  })();

  const { path, labelPath } = gridSelection;

  const { handleMouseMove, handleTouchMove } = useGridInteraction(gridRef);

  // Restore handlers and variables
  const handlePrevMonth = useStableCallback(() => changeMonth(PREVIOUS_MONTH));
  const handleNextMonth = useStableCallback(() => changeMonth(NEXT_MONTH));
  const handleZoomToggle = useStableCallback(() => {
    setAnimated("zoom");
    const zoomLevels = [
      ZoomLevel.WEEK,
      ZoomLevel.MONTH,
      ZoomLevel.YEAR,
    ] as const;
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    const nextIndex = (currentIndex + 1) % zoomLevels.length;
    setZoomLevel(zoomLevels[nextIndex]);
  });

  const transitionKey = `${dateState.currentSystemDate.getMonth()}-${zoomLevel}`;

  return (
    <div
      className="dp-container"
      style={style}
      data-activity={disabled ? "Disabled" : "Active"}
      data-mode={calendarMode}
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
        onMouseOver={handleCellMouseOver}
        onClick={calendarMode === "select" ? handleCellClick : handleSelectDate}
        onDoubleClick={handleCellDoubleClick}
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
