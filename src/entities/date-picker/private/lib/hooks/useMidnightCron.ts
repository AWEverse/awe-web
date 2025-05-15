import { useCallback, useEffect, useState } from "react";
import { getMidnightScheduler } from "../helpers/midnightScheduler";

const useMidnightCron = (onTick?: (tick: number) => void): number => {
  const scheduler = getMidnightScheduler();
  const [tick, setTick] = useState(scheduler.getTick());

  const handleTick = useCallback((newTick: number) => {
    setTick(newTick);
    onTick?.(newTick);
  }, [onTick]);

  useEffect(() => {
    scheduler.on("tick", handleTick);

    return () => {
      scheduler.off("tick", handleTick);
    };
  }, [handleTick, scheduler]);

  return tick;
};

export default useMidnightCron;
