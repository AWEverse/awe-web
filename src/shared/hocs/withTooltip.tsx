import React, { useState, useRef, useLayoutEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStableCallback } from "@/shared/hooks/base";
import { requestMeasure } from "@/lib/modules/fastdom";

interface TooltipProps {
  tContent?: React.ReactNode;
  tPosition?: "top" | "bottom" | "left" | "right";
  tColor?: string;
}

const withTooltip = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { tContent, tPosition = "top", tColor = "black" }: TooltipProps,
) => {
  const Component = (props: P) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const componentRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateTooltipPosition = useStableCallback(() => {
      requestMeasure(() => {
        if (componentRef.current && tooltipRef.current) {
          const rect = componentRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          setPosition(calculateTooltipPosition(rect, tooltipRect, tPosition));
        }
      });
    });

    const handleMouseEnter = useStableCallback(() => {
      setVisible(true);
      updateTooltipPosition();
    });

    const handleMouseLeave = useStableCallback(() => {
      setVisible(false);
    });

    useLayoutEffect(() => {
      const handleResize = () => {
        if (visible) updateTooltipPosition();
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [visible, updateTooltipPosition]);

    return (
      <div
        ref={componentRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", display: "inline-block" }}
      >
        <WrappedComponent {...props} />
        <AnimatePresence>
          {visible && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                top: position.top,
                left: position.left,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                backgroundColor: tColor,
                padding: "5px 10px",
                borderRadius: "4px",
                color: "white",
                whiteSpace: "nowrap",

                pointerEvents: "none",
                zIndex: 1000,
              }}
            >
              {tContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return memo(Component);
};

const calculateTooltipPosition = (
  rect: DOMRect,
  tooltipRect: DOMRect,
  tPosition: "top" | "bottom" | "left" | "right",
) => {
  const offset = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const positions = {
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
  };

  let { top, left } = positions[tPosition];

  if (top < 0) top = rect.bottom + offset;
  if (left < 0) left = rect.left + offset;
  if (left + tooltipRect.width > viewportWidth)
    left = rect.right - tooltipRect.width - offset;
  if (top + tooltipRect.height > viewportHeight)
    top = rect.top - tooltipRect.height - offset;

  return { top, left };
};

export default withTooltip;
