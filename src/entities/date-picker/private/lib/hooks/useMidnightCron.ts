// hooks/useMidnightCron.ts
import { useEffect, useState } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { getMidnightScheduler } from "../helpers/midnightScheduler";

/**
 * React hook to subscribe to midnight ticks (shared between all components)
 * @param onTick - Optional callback to call when midnight occurs
 * @returns Current tick count
 */
const useMidnightCron = (onTick?: (tick: number) => void): number => {
  const scheduler = getMidnightScheduler();
  const [tick, setTick] = useState(scheduler.getTick());
  const onTickStable = useStableCallback(onTick);

  useEffect(() => {
    scheduler.initIfNeeded(); // Lazy initialize scheduler

    const handler = (e: { tick: number }) => {
      setTick(e.tick);
      if (onTickStable) onTickStable(e.tick);
    };

    scheduler.on("tick", handler);

    return () => {
      scheduler.off("tick", handler);
    };
  }, [scheduler, onTickStable]);

  return tick;
};

export default useMidnightCron;
