import { FC, useState, useCallback, useMemo, useRef, memo } from "react";
import { FixedSizeList } from "react-window";
import s from "./TimePicker.module.scss";
import { clamp } from "@/lib/core";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";

interface TimePickerProps {
  initialHour?: number;
  onTimeSelected?: (time: string) => void;
}

const ITEM_HEIGHT = 28;
const VISIBLE_ITEMS = 7;

const TimePicker: FC<TimePickerProps> = ({
  initialHour = 0,
  onTimeSelected,
}) => {
  const [selectedShift, setSelectedShift] = useState(0);

  const times = useMemo(() => {
    const minutesInDay = 24 * 60;

    const normalizedShift = selectedShift === 0 ? 60 : selectedShift;

    return Array.from(
      { length: Math.floor(minutesInDay / normalizedShift) },
      (_, index) => {
        const totalMinutes = index * normalizedShift;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      },
    );
  }, [selectedShift]);

  const listRef = useRef<FixedSizeList>(null);
  const [selectedIndex, setSelectedIndex] = useState(
    initialHour % times.length,
  );

  const handleTimeSelect = useCallback(
    (index: number) => {
      const actualIndex = index % times.length;
      setSelectedIndex(actualIndex);
      onTimeSelected?.(times[actualIndex]);

      if (listRef.current) {
        listRef.current.scrollToItem(index, "center");
      }
    },
    [times, onTimeSelected],
  );

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const actualIndex = index % times.length;
      return (
        <div
          style={style}
          className={`${s.timeItem} ${actualIndex === selectedIndex ? s.selected : ""}`}
          onClick={() => handleTimeSelect(index)}
        >
          <span className={s.timeItem}>{times[actualIndex]}</span>
        </div>
      );
    },
    [times, selectedIndex, handleTimeSelect],
  );

  const handleScroll = useCallback(
    ({ scrollOffset }: { scrollOffset: number }) => {
      const centerIndex =
        Math.round(scrollOffset / ITEM_HEIGHT + VISIBLE_ITEMS / 2) - 1;

      const actualIndex = centerIndex % times.length;

      if (actualIndex !== selectedIndex) {
        setSelectedIndex(actualIndex);
        onTimeSelected?.(times[actualIndex]);
      }
    },
    [times, selectedIndex, onTimeSelected],
  );

  const handleShift = (value: number) => () => {
    setSelectedShift((prev) => clamp(prev + value, 0, 60));
  };

  return (
    <section className={s.container}>
      <FixedSizeList
        ref={listRef}
        height={ITEM_HEIGHT * VISIBLE_ITEMS}
        width="100%"
        itemCount={Number.POSITIVE_INFINITY}
        itemSize={ITEM_HEIGHT}
        onScroll={handleScroll}
        initialScrollOffset={(initialHour % times.length) * ITEM_HEIGHT}
        children={Row}
      />

      <div className={s.shiftContainer}>
        <span className={s.arrow} onClick={handleShift(-5)}>
          <ArrowLeft />
        </span>
        <span className={s.number}>{selectedShift}</span>
        <span className={s.arrow} onClick={handleShift(5)}>
          <ArrowRight />
        </span>
      </div>
    </section>
  );
};

export default memo(TimePicker);
