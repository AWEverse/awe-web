import { FC, useState, useCallback, useMemo, useRef, memo } from "react";
import { FixedSizeList } from "react-window";
import s from "./TimePicker.module.scss";
import { clamp, fastRaf } from "@/lib/core";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";

interface TimePickerProps {
  initialHour?: number;
  onTimeSelected?: (time: string) => void;
}

const ITEM_HEIGHT = 28;
const VISIBLE_ITEMS = 7;
const DEFAULT_SHIFT = 60;
const MIN_SHIFT = 5;
const MAX_SHIFT = 60;

const TimePicker: FC<TimePickerProps> = ({
  initialHour = 0,
  onTimeSelected,
}) => {
  const [selectedShift, setSelectedShift] = useState(DEFAULT_SHIFT);

  const times = useMemo(() => {
    const minutesInDay = 24 * 60;
    const normalizedShift = Math.max(selectedShift, MIN_SHIFT);
    const count = Math.floor(minutesInDay / normalizedShift);
    return Array.from({ length: count }, (_, index) => {
      const totalMinutes = index * normalizedShift;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    });
  }, [selectedShift]);

  const listRef = useRef<FixedSizeList>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(
    () => initialHour % (times.length || 1),
  );

  const handleTimeSelect = useCallback(
    (index: number) => {
      const actualIndex =
        ((index % times.length) + times.length) % times.length;
      setSelectedIndex(actualIndex);
      onTimeSelected?.(times[actualIndex]);
      if (outerRef.current) {
        const offset =
          index * ITEM_HEIGHT -
          (ITEM_HEIGHT * VISIBLE_ITEMS) / 2 +
          ITEM_HEIGHT / 2;
        outerRef.current.scrollTo({ top: offset, behavior: "smooth" });
      } else if (listRef.current) {
        listRef.current.scrollToItem(index, "center");
      }
    },
    [times, onTimeSelected],
  );

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const actualIndex =
        ((index % times.length) + times.length) % times.length;
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
      fastRaf(() => {
        const centerIndex =
          Math.round(scrollOffset / ITEM_HEIGHT + VISIBLE_ITEMS / 2) - 1;
        const actualIndex =
          ((centerIndex % times.length) + times.length) % times.length;
        if (actualIndex !== selectedIndex) {
          setSelectedIndex(actualIndex);
          onTimeSelected?.(times[actualIndex]);
        }
      });
    },
    [times, selectedIndex, onTimeSelected],
  );

  const handleShift = (value: number) => () => {
    setSelectedShift((prev) => {
      let next = prev + value;
      if (next > MAX_SHIFT) next = MIN_SHIFT;
      if (next < MIN_SHIFT) next = MAX_SHIFT;
      return next;
    });
  };

  return (
    <section className={s.container}>
      <FixedSizeList
        ref={listRef}
        outerRef={outerRef}
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
