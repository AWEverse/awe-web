import { useStableCallback } from "@/shared/hooks/base";
import { useMemo, useState } from "react";

export type PanelStackItem<T = any> = {
  key: string;
  component: React.ComponentType<T>;
  props?: T;
  direction: "forward" | "backward";
};

export default function usePanelStack<T>(initial: PanelStackItem<T>[]) {
  const [stack, setStack] = useState<PanelStackItem<T>[]>(initial);

  const push = useStableCallback((item: Omit<PanelStackItem<T>, "direction">) => {
    setStack((prev) => [...prev, { ...item, direction: "forward" } as PanelStackItem<T>]);
  }
  );

  const pop = useStableCallback(() => {
    setStack((prev) => {
      if (prev.length <= 1) return prev; // Early return for single item
      return [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 2], direction: "backward" },
      ];
    });
  }
  );

  const reset = useStableCallback(
    (
      item: Omit<PanelStackItem<T>, "direction">,
      fromIndex: number,
      toIndex: number,
    ) => {
      const direction = toIndex > fromIndex ? "forward" : "backward";
      setStack([{ ...item, direction } as PanelStackItem<T>]);
    },
  );

  const current = useMemo(() => stack.at(-1), [stack]);

  return useMemo(
    () => ({ stack, current, push, pop, reset }),
    [stack, current, push, pop, reset],
  );
}
