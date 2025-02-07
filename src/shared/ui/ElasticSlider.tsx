import branch from "@/lib/core/public/misc/Branch";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import React, { memo, useEffect, useRef, useState } from "react";
import useResizeObserver from "../hooks/DOM/useResizeObserver";

const MAX_OVERFLOW = 5;

interface OwnProps {
  defaultValue?: number;
  startingValue: number;
  maxValue: number;
  className?: string;
  isStepped?: boolean;
  stepSize: number;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}

const documentRef = { current: document.body } as React.RefObject<HTMLElement>;

function ElasticSlider({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = "",
  isStepped = false,
  stepSize = 1,
  startDecorator,
  endDecorator,
}: OwnProps) {
  const [value, setValue] = useState<number>(defaultValue);
  const [region, setRegion] = useState<"left" | "middle" | "right">("middle");

  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  const sliderRef = useRef<HTMLDivElement>(null);

  const rectRef = useRef<DOMRect>(null);

  useMotionValueEvent(clientX, "change", (latestX) => {
    if (!sliderRef.current) return;
    const { left, right } = sliderRef.current!.getBoundingClientRect();

    const extra =
      latestX < left ? left - latestX : latestX > right ? latestX - right : 0;

    setRegion(latestX < left ? "left" : latestX > right ? "right" : "middle");

    overflow.jump(decay(extra, MAX_OVERFLOW));
  });

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current || e.buttons === 0) return;
    const { left, width } = sliderRef.current!.getBoundingClientRect();

    let newValue =
      startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);

    if (isStepped) {
      newValue = Math.round(newValue / stepSize) * stepSize;
    }

    newValue = Math.min(Math.max(newValue, startingValue), maxValue);
    setValue(newValue);
    clientX.jump(e.clientX);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: "spring", bounce: 0.5 });
  };

  const getRangePercentage = () => {
    const totalRange = maxValue - startingValue;

    if (totalRange === 0) {
      return 0;
    }

    return ((value - startingValue) / totalRange) * 100;
  };

  // These transforms adjust the visual properties of the slider track.
  // (They use inline functions to read current motion value snapshots.)
  const scaleX = useTransform(overflow, (ov) => {
    if (!sliderRef.current) {
      return 1;
    }

    const { width } = sliderRef.current!.getBoundingClientRect();

    return 1 + ov / width;
  });

  const scaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]);

  const transformOrigin = useTransform(clientX, (x) => {
    if (!sliderRef.current) {
      return "left";
    }

    const { left, width } = sliderRef.current!.getBoundingClientRect();

    return x < left + width / 2 ? "right" : "left";
  });

  const barHeight = useTransform(scale, [1, 1.2], [6, 12]);
  const marginVertical = useTransform(scale, [1, 1.2], [0, -3]);

  const leftDecoratorX = useTransform(overflow, (ov) =>
    region === "left" ? -ov / scale.get() : 0,
  );
  const rightDecoratorX = useTransform(overflow, (ov) =>
    region === "right" ? ov / scale.get() : 0,
  );

  return (
    <div
      className={`flex flex-col items-center justify-center  w-48 ${className}`}
    >
      <motion.div
        className="flex w-full touch-none select-none items-center justify-center"
        // Scale up on hover or touch.
        onHoverStart={() => animate(scale, 1.2)}
        onHoverEnd={() => animate(scale, 1)}
        onTouchStart={() => animate(scale, 1.2)}
        onTouchEnd={() => animate(scale, 1)}
        style={{
          scale,
          opacity: useTransform(scale, [1, 1.2], [0.7, 1]),
        }}
      >
        {/* Left Decorator */}
        <motion.div
          animate={{
            scale: region === "left" ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{ x: leftDecoratorX }}
        >
          {startDecorator}
        </motion.div>

        {/* Slider Track */}
        <div
          ref={sliderRef}
          className="relative flex w-full max-w-xs flex-grow cursor-grab touch-none select-none items-center py-1"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <motion.div
            className="flex flex-grow"
            style={{
              scaleX,
              scaleY,
              transformOrigin,
              height: barHeight,
              marginTop: marginVertical,
              marginBottom: marginVertical,
            }}
          >
            <div className="relative h-full flex-grow overflow-hidden rounded-full bg-gray-400">
              <div
                className="absolute h-full bg-gray-500 rounded-full"
                style={{ width: `${getRangePercentage()}%` }}
              />
            </div>
          </motion.div>
        </div>

        {/* Right Decorator */}
        <motion.div
          animate={{
            scale: region === "right" ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{ x: rightDecoratorX }}
        >
          {endDecorator}
        </motion.div>
      </motion.div>

      {/* Display the current value */}
      <p className="absolute text-gray-400 transform -translate-y-4 text-xs font-medium tracking-wide">
        {Math.round(value)}
      </p>
    </div>
  );
}

/**
 * Decay function using hyperbolic tangent to produce a smooth transition.
 * For small values, it returns a near-linear mapping; for larger values, it saturates.
 *
 * @param value - The extra distance outside the slider bounds.
 * @param max - The maximum allowed overflow distance.
 * @returns A decayed value based on the hyperbolic tangent.
 */
const decay = (value: number, max: number) =>
  max === 0 ? 0 : max * Math.tanh(value / (2 * max));

export default memo(ElasticSlider);
