import React, { useRef, useEffect, ReactNode } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimationControls,
} from "framer-motion";
import { getIsMobile } from "@/lib/hooks/ui/useAppLayout";

interface FollowCursorProps {
  children: ReactNode;
  className?: string;
  animationConfig?: {
    damping?: number;
    stiffness?: number;
    [key: string]: any;
  };
  hoverScale?: number;
  offsetX?: number;
  cardWidth?: string;
  rotationFactor?: number;
  perspective?: string;
  zoomSensitivity?: number;
  wheelConfig?: {
    damping?: number;
    stiffness?: number;
    [key: string]: any;
  };
  enableTilt?: boolean;
  enableZoom?: boolean;
  enableDrag?: boolean;
}

const calcX = (
  y: number,
  ly: number,
  containerCenterY: number,
  rotationFactor: number,
): number => -(y - ly - containerCenterY) / rotationFactor;

const calcY = (
  x: number,
  lx: number,
  containerCenterX: number,
  rotationFactor: number,
): number => (x - lx - containerCenterX) / rotationFactor;

interface TouchState {
  startX?: number;
  startY?: number;
  offsetX?: number;
  offsetY?: number;
}

const FollowCursor: React.FC<FollowCursorProps> = ({
  children,
  className = "",
  // For Framer Motion, you might map spring settings to stiffness/damping
  animationConfig = { stiffness: 350, damping: 40 },
  hoverScale = 1.1,
  offsetX = 20,
  cardWidth = "200px",
  rotationFactor = 20,
  perspective = "300px",
  zoomSensitivity = 200,
  enableTilt = true,
  enableZoom = true,
  enableDrag = true,
}) => {
  const domTarget = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchState = useRef<TouchState>({});
  // For touch–pinch we store initial values
  const initialZoomRef = useRef(0);
  const initialRotateZRef = useRef(0);

  // We use animation controls for the card’s transforms.
  const controls: AnimationControls = useAnimation();

  // For the wheel-driven inner translation we use a motion value.
  const wheelY = useMotionValue(0);
  // Create a derived transform similar to your wheelTransform function.
  const wheelTransform = useTransform(wheelY, (yValue) => {
    // const containerWidth = containerRef.current
    //   ? containerRef.current.offsetWidth
    //   : window.innerWidth * 0.3;
    const parsedCardWidth = parseFloat(cardWidth);
    // Calculate image height based on container’s width and a percentage of cardWidth.
    const imgHeight = containerRef.current
      ? containerRef.current.offsetWidth * (parsedCardWidth / 100) - 20
      : window.innerWidth * 0.3 - 20;
    return `translateY(${-imgHeight * (yValue < 0 ? 6 : 1) - (yValue % (imgHeight * 5))}px)`;
  });

  // To mimic the combined effect of "scale + zoom" from react-spring,
  // we keep separate refs and update the final scale manually.
  const baseScaleRef = useRef(hoverScale);
  const zoomRef = useRef(0);

  // Set initial values
  useEffect(() => {
    controls.set({
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      // initial combined scale is baseScale + zoom
      scale: baseScaleRef.current + zoomRef.current,
    });
  }, [controls]);

  // TOUCH HANDLING (for mobile with drag & pinch)
  useEffect(() => {
    if (!getIsMobile() || !domTarget.current || !enableDrag) return;

    const card = domTarget.current;
    let isDragging = false;
    let pinchStartDistance = 0;
    let pinchStartAngle = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchState.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          offsetX: 0, // we will get current x from controls on first move
          offsetY: 0,
        };
        // Read current x and y from the controls (if needed, you could store these in refs)
        controls.start({}); // no-op to ensure controls are set
        isDragging = true;
      } else if (e.touches.length === 2 && enableZoom) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        pinchStartDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        pinchStartAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX,
        );
        // Store current zoom and rotateZ from controls’ last values
        // (Here we assume the last known values are in our refs)
        initialZoomRef.current = zoomRef.current;
        initialRotateZRef.current = 0; // assuming starting rotateZ is 0
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging && e.touches.length !== 2) return;

      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - (touchState.current.startX || 0);
        const deltaY = touch.clientY - (touchState.current.startY || 0);
        // For simplicity, here we update x and y relative to the drag start.
        controls.start({
          x: (touchState.current.offsetX || 0) + deltaX,
          y: (touchState.current.offsetY || 0) + deltaY,
          rotateX: 0,
          rotateY: 0,
          scale: baseScaleRef.current + zoomRef.current,
          transition: { type: "spring", ...animationConfig },
        });
      } else if (e.touches.length === 2 && enableZoom) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        const currentAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX,
        );

        const zoomDelta =
          (currentDistance - pinchStartDistance) / zoomSensitivity;
        const rotateDelta = currentAngle - pinchStartAngle;
        zoomRef.current = initialZoomRef.current + zoomDelta;

        controls.start({
          rotateZ: initialRotateZRef.current + rotateDelta,
          scale: baseScaleRef.current + zoomRef.current,
          transition: { type: "spring", ...animationConfig },
        });
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      // On touch end, reset scale to the hoverScale (and reset zoom)
      baseScaleRef.current = hoverScale;
      zoomRef.current = 0;
      controls.start({
        scale: hoverScale,
        transition: { type: "spring", ...animationConfig },
      });
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Update wheelY immediately
      wheelY.set(wheelY.get() + e.deltaY);
    };

    card.addEventListener("touchstart", handleTouchStart, { passive: false });
    card.addEventListener("touchmove", handleTouchMove, { passive: false });
    card.addEventListener("touchend", handleTouchEnd);
    if (enableZoom)
      card.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      card.removeEventListener("touchstart", handleTouchStart);
      card.removeEventListener("touchmove", handleTouchMove);
      card.removeEventListener("touchend", handleTouchEnd);
      card.removeEventListener("wheel", handleWheel);
    };
  }, [
    controls,
    animationConfig,
    hoverScale,
    enableDrag,
    enableZoom,
    zoomSensitivity,
    wheelY,
  ]);

  // MOUSE MOVEMENT (for non-mobile tilt)
  useEffect(() => {
    if (!getIsMobile() && enableTilt) {
      const handleMouseMove = (event: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const containerCenterX = rect.left + rect.width / 2;
        const containerCenterY = rect.top + rect.height / 2;

        const px = event.clientX;
        const py = event.clientY;

        const xPos = px - containerCenterX;
        const yPos = py - containerCenterY;

        // Calculate an offset based on the cardWidth percentage.
        const parsedCardWidth = parseFloat(cardWidth);
        const calculatedWidth = container.offsetWidth * (parsedCardWidth / 100);
        const calculatedOffset = calculatedWidth / 2 + offsetX;

        controls.start({
          x: xPos + calculatedOffset,
          y: yPos,
          rotateX: enableTilt
            ? calcX(py, 0, containerCenterY, rotationFactor)
            : 0,
          rotateY: enableTilt
            ? calcY(px, 0, containerCenterX, rotationFactor)
            : 0,
          scale: hoverScale,
          transition: { type: "spring", ...animationConfig },
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [
    controls,
    cardWidth,
    offsetX,
    hoverScale,
    enableTilt,
    rotationFactor,
    animationConfig,
  ]);

  return (
    <div className={`container ${className}`} ref={containerRef}>
      <motion.div
        ref={domTarget}
        className="absolute rounded-[15px] shadow-[0px_10px_30px_-5px_rgba(0,0,0,0.3)] transition-shadow duration-500 [will-change:transform] touch-none bg-cover"
        style={{
          width: cardWidth,
          // Apply perspective via a CSS transform. (Framer Motion won’t animate this automatically.)
          transform: `perspective(${perspective})`,
        }}
        animate={controls}
        initial={{
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: hoverScale,
        }}
      >
        <motion.div style={{ transform: wheelTransform }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FollowCursor;
