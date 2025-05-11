import { useEffect, useRef, useState } from "react";
import { makeInterpolator } from "../svg/interpolate";

function MorphingPath({
  from,
  to,
  duration = 500, // ms
}: {
  from: string;
  to: string;
  duration?: number;
}) {
  const [d, setD] = useState(from);
  const interpRef = useRef<(t: number) => string>(null);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setD(from);
  }, [from]);

  useEffect(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    interpRef.current = makeInterpolator(d, to);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) return;

      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);

      setD(interpRef.current!(t));

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [from, to, duration]);

  return (
    <path
      d={d}
      fill="rgba(0,128,255,0.1)"
      stroke="#007aff"
      strokeWidth={2}
      strokeDasharray="4"
      strokeDashoffset="8"
    />
  );
}

export default MorphingPath;
