import { useEffect, useRef, useMemo, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { ReadonlySignal } from "@/lib/core/public/signals";
import { useSignalEffect } from "@/lib/hooks/signals/useSignalEffect";

type Props = {
  value: ReadonlySignal<number>;
  direction?: "up" | "down";
  className?: string;
};

export default function Counter({ value, direction = "up", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [latestValue, setLatest] = useState(0);

  // Initialize motionValue; if direction is "down" we use the current signal value (initially 0), otherwise start at 0.
  const motionValue = useMotionValue(direction === "down" ? latestValue : 0);
  const springValue = useSpring(motionValue, { damping: 100, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Update latestValue whenever the provided signal changes.
  useSignalEffect(value, (number) => {
    setLatest(number);
  });

  // When the element is in view, set the motion value to trigger the animation.
  useEffect(() => {
    if (isInView) {
      motionValue.set(direction === "down" ? 0 : latestValue);
    }
  }, [isInView, motionValue, direction]);

  // Create the formatter only once.
  const formatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  // Subscribe to spring value changes and update the DOM text.
  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatter.format(Math.round(latest));
      }
    });
    return unsubscribe;
  }, [springValue, formatter]);

  return (
    <span className={className} ref={ref}>
      {latestValue}
    </span>
  );
}
