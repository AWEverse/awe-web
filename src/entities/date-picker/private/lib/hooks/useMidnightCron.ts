import { useState } from "react";
import { cleanupMidnightScheduler, getMidnightScheduler } from "../helpers/midnightScheduler";
import { useStableCallback } from "@/shared/hooks/base";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";

const useMidnightCron = (onTick?: (tick: number) => void): number => {
  const scheduler = getMidnightScheduler();
  const [tick, setTick] = useState(scheduler.getTick());
  const stableTickHandler = useStableCallback(onTick);

  useComponentDidMount(() => {
    scheduler.initIfNeeded();

    const handler = (newTick: number) => {
      setTick(newTick);
      stableTickHandler?.(newTick);
    };

    scheduler.on("tick", handler);

    return () => {
      scheduler.off("tick", handler);
      cleanupMidnightScheduler();
    };
  });

  return tick;
};

export default useMidnightCron;
