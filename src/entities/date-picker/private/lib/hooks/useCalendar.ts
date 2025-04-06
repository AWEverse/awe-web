import { useState, useCallback, useMemo } from "react";
import { CalendarAnimationType } from "../types";
import { HISTORY_LIMIT } from "../constans";
import {
  packDate,
  createNewMonthDate,
  unpackDate,
  isDateValid,
  getMonthDifference,
  syncSystemDate,
} from "../utils";

interface CalendarState {
  currentSystemDate: number;
  userSelectedDate: number;
  history: number[];
  future: number[];
}

type CalendarMode = "basic" | "select";

const useCalendar = (initialDate: Date, minAt?: Date, maxAt?: Date) => {
  const initialPacked = packDate(
    initialDate.getFullYear(),
    initialDate.getMonth(),
    initialDate.getDate(),
  );
  const minPacked = minAt
    ? packDate(minAt.getFullYear(), minAt.getMonth(), minAt.getDate())
    : undefined;
  const maxPacked = maxAt
    ? packDate(maxAt.getFullYear(), maxAt.getMonth(), maxAt.getDate())
    : undefined;

  const [state, setState] = useState<CalendarState>({
    currentSystemDate: initialPacked,
    userSelectedDate: initialPacked,
    history: [],
    future: [],
  });

  const [animated, setAnimated] = useState<CalendarAnimationType>("LTR");

  // Month change (← / →)
  const changeMonth = useCallback((increment: number) => {
    setAnimated(increment < 0 ? "LTR" : "RTL");

    setState((prev) => {
      const newPacked = createNewMonthDate(prev.currentSystemDate, increment);
      if (
        unpackDate(prev.currentSystemDate).month === unpackDate(newPacked).month
      )
        return prev;

      return {
        ...prev,
        currentSystemDate: newPacked,
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
      const newPacked = packDate(year, month, day);
      if (!isDateValid(newPacked, minPacked, maxPacked)) return;

      const monthDiff = getMonthDifference(newPacked, state.currentSystemDate);
      setAnimated(monthDiff < 0 ? "LTR" : "RTL");

      setState((prev) => ({
        ...prev,
        userSelectedDate: newPacked,
        currentSystemDate: syncSystemDate(newPacked),
        history: [prev.userSelectedDate, ...prev.history].slice(
          0,
          HISTORY_LIMIT,
        ),
        future: [],
      }));
    },
    [minPacked, maxPacked, state.currentSystemDate],
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

  const dateState = useMemo(() => {
    const current = unpackDate(state.currentSystemDate);
    const selected = unpackDate(state.userSelectedDate);
    return {
      currentSystemDate: new Date(current.year, current.month, current.day),
      userSelectedDate: new Date(selected.year, selected.month, selected.day),
    };
  }, [state.currentSystemDate, state.userSelectedDate]);

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
