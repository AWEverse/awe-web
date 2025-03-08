import { useState, useMemo, memo, useCallback } from "react";
import { requestMeasure } from "@/lib/modules/fastdom";
import buildClassName from "@/shared/lib/buildClassName";
import { clamp01, debounce } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";

interface Ripple {
  x: number;
  y: number;
  size: number;
}

const ANIMATION_DURATION_MS = 500;

interface OwnProps {
  duration?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const RippleEffect: React.FC<OwnProps> = memo((props) => {
  const { opacity = 0.175, color = "#FFFFFF", className } = props;

  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleMouseDown = useStableCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.button !== 0) return;

      const container = e.currentTarget;
      const position = container.getBoundingClientRect();

      requestMeasure(() => {
        const rippleSize = container.offsetWidth / 2;
        setRipples((prevRipples) => [
          ...prevRipples,
          {
            x: e.clientX - position.x - rippleSize / 2,
            y: e.clientY - position.y - rippleSize / 2,
            size: rippleSize,
          },
        ]);
      });
    },
  );

  return (
    <div className="ripple-container" onMouseDown={handleMouseDown}>
      {ripples.map(({ x, y, size }, index) => (
        <div
          key={index}
          className={buildClassName("ripple-wave", className)}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: className
              ? undefined
              : hexToRgba(color, clamp01(opacity)),
          }}
        />
      ))}
    </div>
  );
});

export default RippleEffect;
