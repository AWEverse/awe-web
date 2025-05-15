import { useState, useCallback, useMemo } from "react";
import { CalendarAnimationType } from "../types";
import { HISTORY_LIMIT } from "../constans";
import {
  packDate,
  createNewMonthDate,
  unpackDate,
  isDateValid,
  getMonthDifference,
} from "../utils";

const toTimestamp = (year: number, month: number, day: number) =>
  new Date(year, month, day).getTime();

const timestampToPacked = (timestamp: number | Date) => {
  const date = new Date(timestamp);
  return packDate(date.getFullYear(), date.getMonth(), date.getDate());
};

interface CalendarState {
  currentSystemDate: number;
  userSelectedDate: number;
  history: number[];
  future: number[];
}

type CalendarMode = "basic" | "select";

const useCalendar = (initialDate: Date, minAt?: Date, maxAt?: Date) => {
  const initialTimestamp = useMemo(
    () =>
      toTimestamp(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        initialDate.getDate(),
      ),
    [initialDate],
  );

  const [state, setState] = useState<CalendarState>(() => ({
    currentSystemDate: initialTimestamp,
    userSelectedDate: initialTimestamp,
    history: [],
    future: [],
  }));
  const [animated, setAnimated] = useState<CalendarAnimationType>("LTR");

  const changeMonth = useCallback((increment: number) => {
    setAnimated(increment < 0 ? "LTR" : "RTL");
    setState((prev) => {
      const prevPacked = timestampToPacked(prev.currentSystemDate);
      const newPacked = createNewMonthDate(prevPacked, increment);
      const newPackedObj = unpackDate(newPacked);
      const prevPackedObj = unpackDate(prevPacked);
      if (
        prevPackedObj.month === newPackedObj.month &&
        prevPackedObj.year === newPackedObj.year
      ) {
        return prev;
      }
      const newTimestamp = toTimestamp(
        newPackedObj.year,
        newPackedObj.month,
        newPackedObj.day,
      );
      return {
        ...prev,
        currentSystemDate: newTimestamp,
        history: [prev.currentSystemDate, ...prev.history].slice(
          0,
          HISTORY_LIMIT,
        ),
        future: [],
      };
    });
  }, []);

  const handleDateSelect = useCallback(
    (day: number, month: number, year: number) => {
      const newTimestamp = toTimestamp(year, month, day);
      const packedDate = packDate(year, month, day);
      const packedMin = minAt
        ? packDate(minAt.getFullYear(), minAt.getMonth(), minAt.getDate())
        : undefined;
      const packedMax = maxAt
        ? packDate(maxAt.getFullYear(), maxAt.getMonth(), maxAt.getDate())
        : undefined;
      if (!isDateValid(packedDate, packedMin, packedMax)) return;
      setState((prev) => {
        const monthDiff = getMonthDifference(
          timestampToPacked(newTimestamp),
          timestampToPacked(prev.currentSystemDate),
        );
        setAnimated(monthDiff < 0 ? "LTR" : "RTL");
        return {
          ...prev,
          userSelectedDate: newTimestamp,
          currentSystemDate: newTimestamp,
          history: [prev.userSelectedDate, ...prev.history].slice(
            0,
            HISTORY_LIMIT,
          ),
          future: [],
        };
      });
    },
    [minAt, maxAt],
  );

  const handleUndo = useCallback(() => {
    setState((prev) => {
      if (!prev.history.length) return prev;
      const [last, ...rest] = prev.history;
      return {
        ...prev,
        currentSystemDate: last,
        userSelectedDate: last,
        history: rest,
        future: [prev.userSelectedDate, ...prev.future].slice(0, HISTORY_LIMIT),
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setState((prev) => {
      if (!prev.future.length) return prev;
      const [next, ...rest] = prev.future;
      return {
        ...prev,
        currentSystemDate: next,
        userSelectedDate: next,
        history: [prev.userSelectedDate, ...prev.history].slice(
          0,
          HISTORY_LIMIT,
        ),
        future: rest,
      };
    });
  }, []);

  const dateState = useMemo(
    () => ({
      currentSystemDate: new Date(state.currentSystemDate),
      userSelectedDate: new Date(state.userSelectedDate),
    }),
    [state.currentSystemDate, state.userSelectedDate],
  );

  return useMemo(
    () => ({
      animated,
      setAnimated,
      dateState,
      changeMonth,
      handleDateSelect,
      handleUndo,
      handleRedo,
    }),
    [
      animated,
      dateState,
      changeMonth,
      handleDateSelect,
      handleUndo,
      handleRedo,
    ],
  );
};

export default useCalendar;
