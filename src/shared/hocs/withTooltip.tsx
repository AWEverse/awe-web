import React, { useState, useRef, useMemo, useLayoutEffect, memo } from "react";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";
import { requestMeasure } from "@/lib/modules/fastdom/fastdom";
import { pipe } from "@/lib/core/public/misc/Pipe";
import { withFreezeWhenClosed } from "@/lib/core";

interface TooltipProps {
  tContent: React.ReactNode;
  tPosition?: "top" | "bottom" | "left" | "right";
  tColor?: string;
}

interface TooltipState {
  tIsVisible: boolean;
  tPosition: { top: number; left: number };
}

/**
 * HOC to add a tooltip to a component
 * @param WrappedComponent - The component to wrap
 * @param tContent - The tContent of the tooltip
 * @param tPosition - The tPosition of the tooltip
 * @returns The wrapped component with a tooltip
 *
 * each prop name begins with a `t`-tooltip prefix to avoid some conflicts and provide a better way to search for props
 */
const withTooltip = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { tContent, tPosition = "top", tColor = "black" }: TooltipProps,
) => {
  const Component = (props: P) => {
    const [tooltipState, setTooltipState] = useState<TooltipState>({
      tIsVisible: false,
      tPosition: { top: 0, left: 0 },
    });

    const componentRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Callback to calculate and set the tooltip tPosition
    const updateTooltipPosition = useLastCallback(() => {
      requestMeasure(() => {
        if (componentRef.current && tooltipRef.current) {
          const rect = componentRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const newPosition = calculateTooltipPosition(
            rect,
            tooltipRect,
            tPosition,
          );

          setTooltipState((prevState) => ({
            ...prevState,
            tPosition: newPosition,
          }));
        }
      });
    });

    const handleMouseEnter = useLastCallback(() => {
      setTooltipState((prevState) => ({
        ...prevState,
        tIsVisible: true,
      }));
      updateTooltipPosition();
    });

    const handleMouseLeave = useLastCallback(() => {
      setTooltipState((prevState) => ({
        ...prevState,
        tIsVisible: false,
      }));
    });

    // RetPosition tooltip on window resize
    useLayoutEffect(() => {
      const handleResize = () => {
        if (tooltipState.tIsVisible) {
          updateTooltipPosition();
        }
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [tooltipState.tIsVisible, updateTooltipPosition]);

    return (
      <div
        ref={componentRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", display: "inline-block" }}
      >
        <WrappedComponent {...(props as P)} />

        {tooltipState.tIsVisible && (
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              top: tooltipState.tPosition.top,
              left: tooltipState.tPosition.left,
              backgroundColor: tColor,
              padding: "5px 10px",
              borderRadius: "4px",
              color: "white",
              whiteSpace: "nowrap",
              transform:
                tPosition === "top" || tPosition === "bottom"
                  ? "translateX(-50%)"
                  : "translateY(-50%)",
              pointerEvents: "none", // Ensure the tooltip does not interfere with mouse events
              zIndex: 1000,
            }}
          >
            {tContent}
          </div>
        )}
      </div>
    );
  };

  return pipe(withFreezeWhenClosed, memo)(Component);
};

const calculateTooltipPosition = (
  rect: DOMRect,
  tooltipRect: DOMRect,
  tPosition: string = "top",
) => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const offset = 8; // Distance between the tooltip and the component
  const tPositions = useMemo(
    () => ({
      top: {
        top: rect.top - tooltipRect.height - offset,
        left: rect.left + rect.width / 2 - tooltipRect.width / 2,
      },
      bottom: {
        top: rect.bottom + offset,
        left: rect.left + rect.width / 2 - tooltipRect.width / 2,
      },
      left: {
        top: rect.top + rect.height / 2 - tooltipRect.height / 2,
        left: rect.left - tooltipRect.width - offset,
      },
      right: {
        top: rect.top + rect.height / 2 - tooltipRect.height / 2,
        left: rect.right + offset,
      },
    }),
    [rect, tooltipRect, offset],
  );

  let { top, left } = tPositions[tPosition as keyof typeof tPositions];

  // Adjust for screen boundaries (prevent overflow)
  if (top < 0) top = rect.bottom + offset; // Switch to bottom if top overflows
  if (left < 0) left = rect.left + offset; // Adjust left if overflowing on the left
  if (left + tooltipRect.width > viewportWidth)
    left = rect.right - tooltipRect.width - offset; // Adjust if overflowing on the right
  if (top + tooltipRect.height > viewportHeight)
    top = rect.top - tooltipRect.height - offset; // Switch to top if bottom overflows

  return { top, left };
};

export default withTooltip;
