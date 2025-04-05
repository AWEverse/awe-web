import { useState, useRef, useCallback } from "react";
import CalendarInvoker from "../commands/CalendarInvoker";
import ChangeMonthCommand from "../commands/ChangeMonthCommand";
import SelectDateCommand from "../commands/SelectDateCommand";

const isDateValid = (date: Date, minAt?: Date, maxAt?: Date) => {
  if (minAt && date < minAt) return false;
  if (maxAt && date > maxAt) return false;
  return true;
};

const useCalendar = (initialDate: Date, minAt?: Date, maxAt?: Date) => {
  const [dateState, setDateState] = useState({
    currentSystemDate: initialDate,
    userSelectedDate: initialDate,
  });

  const invoker = useRef(new CalendarInvoker()).current;

  const changeMonth = useCallback(
    (increment: number) => {
      const previousDate = new Date(dateState.currentSystemDate);

      invoker.addCommand(
        new ChangeMonthCommand(
          increment,
          (inc) => {
            setDateState((prev) => {
              const newDate = new Date(prev.currentSystemDate);
              newDate.setDate(1);
              newDate.setMonth(newDate.getMonth() + inc);

              if (prev.currentSystemDate.getMonth() !== newDate.getMonth()) {
                return { ...prev, currentSystemDate: newDate };
              }

              return prev;
            });
          },
          previousDate
        ).execute
      );

      invoker.executeCommands();
    },
    [dateState]
  );

  const handleDateSelect = useCallback(
    (day: number, month: number, year: number) => {
      const newDate = new Date(year, month, day);

      if (!isDateValid(newDate, minAt, maxAt)) return;

      const previousDate = new Date(dateState.userSelectedDate);

      invoker.addCommand(
        new SelectDateCommand(
          newDate,
          (date) => {
            setDateState((prev) => ({ ...prev, userSelectedDate: date }));
          },
          previousDate
        ).execute
      );

      invoker.executeCommands();
    },
    [dateState, minAt, maxAt]
  );

  const handleUndo = useCallback(() => {
    invoker.undo();
  }, [invoker]);

  const handleRedo = useCallback(() => {
    invoker.redo();
  }, [invoker]);

  return {
    dateState,
    changeMonth,
    handleDateSelect,
    handleUndo,
    handleRedo,
  };
};

export default useCalendar;
