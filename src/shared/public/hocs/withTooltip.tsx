import React, {
  useState,
  useRef,
  useEffect,
  memo,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  motion,
  AnimatePresence,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";
import { useStableCallback } from "@/shared/hooks/base";
import { requestMeasure } from "@/lib/modules/fastdom";
import Portal from "@/shared/ui/Portal";
import { IS_MOBILE } from "@/lib/core";

interface TooltipProps {
  content?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  color?: string;
  delay?: number;
  hideDelay?: number;
  arrow?: boolean;
  distance?: number;
  animation?: {
    initial?: TargetAndTransition | VariantLabels;
    animate?: TargetAndTransition | VariantLabels;
    exit?: TargetAndTransition | VariantLabels;
    transition?: {
      duration?: number;
      [key: string]: any;
    };
  };
  touchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  arrowSize?: number;
  borderRadius?: number;
  tooltipId?: string;
}

interface Position {
  top: number;
  left: number;
  arrowTop: number | null;
  arrowLeft: number | null;
  actualPosition: "top" | "bottom" | "left" | "right";
}

const DEFAULT_ANIMATION = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
  transition: { duration: 0.125 },
} as const;

interface TooltipTriggerProps {
  onShowTooltip: () => void;
  onHideTooltip: () => void;
  touchable?: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
}

const useTooltipHandlers = (
  showTooltip: () => void,
  hideTooltip: () => void,
  touchable?: boolean,
): TooltipTriggerProps => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlers = useMemo(
    () => ({
      onShowTooltip: showTooltip,
      onHideTooltip: hideTooltip,
      touchable,
      ref: componentRef,
    }),
    [showTooltip, hideTooltip, touchable],
  );

  return handlers;
};

const getComponentProps = <
  P extends {
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
  },
>(
  triggerProps: TooltipTriggerProps,
  originalProps: P,
): P & React.HTMLAttributes<HTMLElement> => {
  const { onShowTooltip, onHideTooltip, touchable, ref } = triggerProps;

  return {
    ...originalProps,
    ref,
    ...(touchable && IS_MOBILE
      ? {
          onClick: (e: React.MouseEvent) => {
            onShowTooltip();
            if (originalProps.onClick) {
              originalProps.onClick(e);
            }
          },
          onBlur: (e: React.FocusEvent) => {
            onHideTooltip();
            if (originalProps.onBlur) {
              originalProps.onBlur(e);
            }
          },
        }
      : {
          onMouseEnter: (e: React.MouseEvent) => {
            onShowTooltip();
            if (originalProps.onMouseEnter) {
              originalProps.onMouseEnter(e);
            }
          },
          onMouseLeave: (e: React.MouseEvent) => {
            onHideTooltip();
            if (originalProps.onMouseLeave) {
              originalProps.onMouseLeave(e);
            }
          },
        }),
  } as P & React.HTMLAttributes<HTMLElement>;
};

const calculateTooltipPosition = (
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPosition: "top" | "bottom" | "left" | "right",
  distance = 8,
  arrowSize = 6,
): Position => {
  // Get window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Convert trigger rect to window coordinates
  const trigger = {
    top: triggerRect.top + window.scrollY,
    left: triggerRect.left + window.scrollX,
    width: triggerRect.width,
    height: triggerRect.height,
    bottom: triggerRect.bottom + window.scrollY,
    right: triggerRect.right + window.scrollX,
  };

  const positions: Array<"top" | "bottom" | "left" | "right"> = [
    preferredPosition,
    ...(["top", "bottom", "left", "right"] as const).filter(
      (p) => p !== preferredPosition,
    ),
  ];

  for (const pos of positions) {
    let basePosition: Position = {
      top: 0,
      left: 0,
      arrowTop: null,
      arrowLeft: null,
      actualPosition: pos,
    };

    switch (pos) {
      case "top":
        basePosition = {
          ...basePosition,
          top: trigger.top - tooltipRect.height - distance - arrowSize,
          left: trigger.left + (trigger.width - tooltipRect.width) / 2,
          arrowLeft: tooltipRect.width / 2,
        };
        break;
      case "bottom":
        basePosition = {
          ...basePosition,
          top: trigger.bottom + distance,
          left: trigger.left + (trigger.width - tooltipRect.width) / 2,
          arrowLeft: tooltipRect.width / 2,
        };
        break;
      case "left":
        basePosition = {
          ...basePosition,
          top:
            trigger.top + (trigger.height - tooltipRect.height) / 2 - arrowSize,
          left: trigger.left - tooltipRect.width - distance,
          arrowTop: tooltipRect.height / 2,
        };
        break;
      case "right":
        basePosition = {
          ...basePosition,
          top:
            trigger.top + (trigger.height - tooltipRect.height) / 2 - arrowSize,
          left: trigger.right + distance,
          arrowTop: tooltipRect.height / 2,
        };
        break;
    }

    // Check if tooltip fits in window
    if (
      basePosition.top >= 0 &&
      basePosition.left >= 0 &&
      basePosition.top + tooltipRect.height <= windowHeight &&
      basePosition.left + tooltipRect.width <= windowWidth
    ) {
      return basePosition;
    }
  }

  return {
    top: Math.max(0, Math.min(windowHeight - tooltipRect.height, trigger.top)),
    left: Math.max(0, Math.min(windowWidth - tooltipRect.width, trigger.left)),
    arrowTop: null,
    arrowLeft: tooltipRect.width / 2,
    actualPosition: positions[0],
  };
};

const getArrowStyle = (
  positionState: Position,
  color: string,
  arrowSize = 6,
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    border: `${arrowSize}px solid transparent`,
  };
  const styles: Record<string, React.CSSProperties> = {
    top: {
      ...baseStyle,
      bottom: -arrowSize * 2,
      left: positionState.arrowLeft
        ? positionState.arrowLeft + arrowSize
        : "50%",
      borderTopColor: color,
      transform: "translateX(-50%)",
    },
    bottom: {
      ...baseStyle,
      top: -arrowSize * 2,
      left: positionState.arrowLeft
        ? positionState.arrowLeft + arrowSize
        : "50%",
      borderBottomColor: color,
      transform: "translateX(-50%)",
    },
    left: {
      ...baseStyle,
      right: -arrowSize * 2,
      top: positionState.arrowTop ?? "50%",
      borderLeftColor: color,
      transform: "translateY(-50%)",
    },
    right: {
      ...baseStyle,
      left: -arrowSize * 2,
      top: positionState.arrowTop ?? "50%",
      borderRightColor: color,
      transform: "translateY(-50%)",
    },
  };
  return styles[positionState.actualPosition];
};

const withTooltip = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  {
    content,
    position: initialPosition = "top",
    color = "black",
    delay = 200,
    hideDelay = 0,
    arrow = true,
    distance = 8,
    animation = DEFAULT_ANIMATION,
    touchable = false,
    className,
    style,
    arrowSize = 6,
    borderRadius = 4,
    tooltipId,
  }: TooltipProps = {},
) => {
  const Component = (props: P) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<Position>({
      top: 0,
      left: 0,
      arrowTop: null,
      arrowLeft: null,
      actualPosition: initialPosition,
    });
    const [isComputing, setIsComputing] = useState(false);
    const [mounted, setMounted] = useState(true);

    const tooltipRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<number | null>(null);
    const hideTimeoutRef = useRef<number | null>(null);

    const updateTooltipPosition = useStableCallback(() => {
      if (isComputing || !mounted) return;
      setIsComputing(true);
      requestMeasure(() => {
        if (triggerProps.ref.current && tooltipRef.current) {
          const rect = triggerProps.ref.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          setPosition(
            calculateTooltipPosition(
              rect,
              tooltipRect,
              initialPosition,
              distance,
              arrowSize,
            ),
          );
        }
        setIsComputing(false);
      });
    });

    const showTooltip = useStableCallback(() => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      showTimeoutRef.current = window.setTimeout(() => {
        setVisible(true);
      }, delay);
    });

    const hideTooltip = useStableCallback(() => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      hideTimeoutRef.current = window.setTimeout(() => {
        setVisible(false);
      }, hideDelay);
    });

    const triggerProps = useTooltipHandlers(
      showTooltip,
      hideTooltip,
      touchable,
    );

    useLayoutEffect(() => {
      if (visible) updateTooltipPosition();
    }, [visible, updateTooltipPosition]);

    useEffect(() => {
      setMounted(true);
      const handleScroll = () => {
        if (visible) updateTooltipPosition();
      };
      const handleResize = () => {
        if (visible) updateTooltipPosition();
      };
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        setMounted(false);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, [visible, updateTooltipPosition]);

    const triggerAriaProps =
      tooltipId && visible ? { "aria-describedby": tooltipId } : {};

    return (
      <>
        <WrappedComponent
          {...getComponentProps(triggerProps, props)}
          {...triggerAriaProps}
        />
        <Portal>
          <AnimatePresence>
            {visible && (
              <motion.div
                ref={tooltipRef}
                id={tooltipId}
                role="tooltip"
                initial={animation.initial}
                animate={animation.animate}
                exit={animation.exit}
                transition={animation.transition}
                style={{
                  position: "fixed",
                  backgroundColor: color,
                  borderRadius: borderRadius,
                  zIndex: 1000,
                  top: position.top,
                  left: position.left,
                  ...style,
                  transformOrigin:
                    position.actualPosition === "top"
                      ? "bottom center"
                      : position.actualPosition === "bottom"
                        ? "top center"
                        : position.actualPosition === "left"
                          ? "center right"
                          : "center left",
                }}
                className={className}
              >
                {content}
                {arrow && (
                  <div style={getArrowStyle(position, color, arrowSize)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Portal>
      </>
    );
  };
  return memo(Component);
};

export default withTooltip;
