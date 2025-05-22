import { useState, useRef, memo, useEffect } from "react";
import { requestMeasure } from "@/lib/modules/fastdom";
import buildClassName from "@/shared/lib/buildClassName";
import { clamp01 } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import { useTimeout } from "@/shared/hooks/shedulers";

interface RippleProps {
  x: number;
  y: number;
  size: number;
  onComplete: () => void;
  duration: number;
  className?: string;
  color: string;
  opacity: number;
}

const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const Ripple = ({
  x,
  y,
  size,
  onComplete,
  duration,
  className,
  color,
  opacity,
}: RippleProps) => {
  useTimeout(onComplete, duration);

  return (
    <div
      inert
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
  );
};

interface OwnProps {
  duration?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

interface RippleData {
  id: number;
  x: number;
  y: number;
  size: number;
}

const RippleEffect: React.FC<OwnProps> = memo((props) => {
  const {
    duration = 500,
    color = "#FFFFFF",
    opacity = 0.175,
    className,
  } = props;
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const nextId = useRef(0);

  const handleMouseDown = useStableCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.button !== 0) return;
      const container = e.currentTarget;

      requestMeasure(() => {
        const position = container.getBoundingClientRect();
        const rippleSize = container.offsetWidth / 2;
        const id = nextId.current++;
        const x = e.clientX - position.x - rippleSize / 2;
        const y = e.clientY - position.y - rippleSize / 2;

        setRipples((prev) => [...prev, { id, x, y, size: rippleSize }]);
      });
    },
  );

  const handleOnComplete = useStableCallback((rippleId: number) =>
    setRipples((prev) => prev.filter((r) => r.id !== rippleId)),
  );

  return (
    <div className="ripple-container" onMouseDown={handleMouseDown}>
      {ripples.map((ripple) => (
        <Ripple
          key={ripple.id}
          x={ripple.x}
          y={ripple.y}
          size={ripple.size}
          onComplete={() => handleOnComplete(ripple.id)}
          duration={duration}
          className={className}
          color={color}
          opacity={opacity}
        />
      ))}
    </div>
  );
});

export default RippleEffect;
