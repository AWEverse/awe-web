import React, { useRef, useEffect, ReactNode, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import "./FollowCursor.css";

interface FollowCursorProps {
  children: ReactNode;
  className?: string;
  animationConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    [key: string]: any;
  };
  hoverScale?: number;
  offsetX?: number;
  cardWidth?: string;
  rotationFactor?: number;
  perspective?: string;
  zoomSensitivity?: number;
  wheelConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    [key: string]: any;
  };
  enableTilt?: boolean;
  enableZoom?: boolean;
  enableDrag?: boolean;
  smoothingFactor?: number;
  velocityThreshold?: number;
  maxTiltAngle?: number;
}

const isMobile = (): boolean =>
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

interface TouchState {
  startX?: number;
  startY?: number;
  offsetX?: number;
  offsetY?: number;
}

// Advanced algorithm for natural movement
const calculateTiltAngle = (
  pos: number,
  center: number,
  factor: number,
  maxAngle: number,
  velocity: number,
  velocityThreshold: number,
): number => {
  // Basic tilt calculation
  const rawAngle =
    ((pos - center) / factor) *
    (Math.abs(velocity) > velocityThreshold ? 1.2 : 1);

  // Apply easing function for more natural movement
  const easedAngle = Math.sign(rawAngle) * Math.pow(Math.abs(rawAngle), 0.8);

  // Apply max angle constraint with smooth clamping
  return Math.sign(easedAngle) * Math.min(Math.abs(easedAngle), maxAngle);
};

const FollowCursor: React.FC<FollowCursorProps> = ({
  children,
  className = "",
  animationConfig = { stiffness: 350, damping: 30, mass: 1 },
  hoverScale = 1.1,
  offsetX = 20,
  cardWidth = "200px",
  rotationFactor = 20,
  perspective = "300px",
  zoomSensitivity = 200,
  wheelConfig = { stiffness: 200, damping: 20, mass: 1 },
  enableTilt = true,
  enableZoom = true,
  enableDrag = true,
  smoothingFactor = 0.2,
  velocityThreshold = 0.05,
  maxTiltAngle = 10,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchState = useRef<TouchState>({});
  const prevMousePos = useRef({ x: 0, y: 0 });
  const mouseVelocity = useRef({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rotateZ = useMotionValue(0);
  const scale = useMotionValue(1);
  const zoomScale = useMotionValue(0);
  const wheelY = useMotionValue(0);

  const springX = useSpring(x, animationConfig);
  const springY = useSpring(y, animationConfig);
  const springRotateX = useSpring(rotateX, animationConfig);
  const springRotateY = useSpring(rotateY, animationConfig);
  const springRotateZ = useSpring(rotateZ, animationConfig);
  const springZoom = useSpring(zoomScale, animationConfig);
  const springWheel = useSpring(wheelY, wheelConfig);

  const combinedScale = useTransform<number, number>(
    [scale, springZoom],
    ([s, z]) => s + z,
  );

  useEffect(() => {
    const updateVelocity = () => {
      const currentMouse = { x: x.get(), y: y.get() };
      mouseVelocity.current = {
        x: (currentMouse.x - prevMousePos.current.x) * smoothingFactor,
        y: (currentMouse.y - prevMousePos.current.y) * smoothingFactor,
      };
      prevMousePos.current = currentMouse;
      requestAnimationFrame(updateVelocity);
    };

    const animFrame = requestAnimationFrame(updateVelocity);
    return () => cancelAnimationFrame(animFrame);
  }, [x, y, smoothingFactor]);

  useEffect(() => {
    if (!isMobile() || !enableDrag) return;

    const card = containerRef.current;
    if (!card) return;

    let isDragging = false;
    let pinchStartDistance = 0;
    let pinchStartAngle = 0;
    let initialZoom = 0;
    let initialRotateZ = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchState.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          offsetX: x.get(),
          offsetY: y.get(),
        };
        isDragging = true;
        scale.set(hoverScale);
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
        initialZoom = zoomScale.get();
        initialRotateZ = rotateZ.get();
        setIsPinching(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if ((!isDragging && e.touches.length !== 2) || !card) return;

      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - (touchState.current.startX || 0);
        const deltaY = touch.clientY - (touchState.current.startY || 0);

        x.set((touchState.current.offsetX || 0) + deltaX);
        y.set((touchState.current.offsetY || 0) + deltaY);
        rotateX.set(0);
        rotateY.set(0);
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

        zoomScale.set(initialZoom + zoomDelta);
        rotateZ.set(initialRotateZ + (rotateDelta * 180) / Math.PI);
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      setIsPinching(false);
      scale.set(1);
    };

    const handleWheel = (e: WheelEvent) => {
      if (!enableZoom) return;
      e.preventDefault();
      wheelY.set(wheelY.get() + e.deltaY);
    };

    card.addEventListener("touchstart", handleTouchStart, { passive: false });
    card.addEventListener("touchmove", handleTouchMove, { passive: false });
    card.addEventListener("touchend", handleTouchEnd);
    if (enableZoom) {
      card.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      card.removeEventListener("touchstart", handleTouchStart);
      card.removeEventListener("touchmove", handleTouchMove);
      card.removeEventListener("touchend", handleTouchEnd);
      card.removeEventListener("wheel", handleWheel);
    };
  }, [
    enableDrag,
    enableZoom,
    hoverScale,
    x,
    y,
    rotateX,
    rotateY,
    rotateZ,
    zoomScale,
    wheelY,
    zoomSensitivity,
    scale,
  ]);

  // Mouse movement logic with advanced algorithm
  useEffect(() => {
    if (isMobile() || !enableTilt) return;

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

      // Calculate distance from center for hover detection
      const distFromCenter = Math.sqrt(xPos * xPos + yPos * yPos);
      const isHovering = distFromCenter < rect.width * 1.5;

      // Calculate card position with offset
      const parsedCardWidth = parseFloat(cardWidth);
      const calculatedWidth = container.offsetWidth * (parsedCardWidth / 100);
      const calculatedOffset = calculatedWidth / 2 + offsetX;

      x.set(xPos + calculatedOffset);
      y.set(yPos);

      // Apply advanced tilt algorithm only when hovering
      if (isHovering && enableTilt) {
        rotateX.set(
          calculateTiltAngle(
            py,
            containerCenterY,
            rotationFactor,
            maxTiltAngle,
            mouseVelocity.current.y,
            velocityThreshold,
          ),
        );

        rotateY.set(
          calculateTiltAngle(
            px,
            containerCenterX,
            rotationFactor,
            maxTiltAngle,
            mouseVelocity.current.x,
            velocityThreshold,
          ) * -1, // Invert for natural feel
        );
      }

      // Set scale based on hover state
      scale.set(isHovering ? hoverScale : 1);
    };

    const handleMouseLeave = () => {
      // Reset to neutral position when mouse leaves
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    enableTilt,
    rotationFactor,
    cardWidth,
    offsetX,
    hoverScale,
    x,
    y,
    rotateX,
    rotateY,
    scale,
    maxTiltAngle,
    velocityThreshold,
  ]);

  // Transform for wheel scrolling content
  const wheelTransform = (yValue: number): string => {
    const imgHeight = containerRef.current
      ? containerRef.current.offsetWidth * (parseFloat(cardWidth) / 100) - 20
      : window.innerWidth * 0.3 - 20;
    return `translateY(${-imgHeight * (yValue < 0 ? 6 : 1) - (yValue % (imgHeight * 5))}px)`;
  };

  return (
    <div className={`container ${className}`} ref={containerRef}>
      <motion.div
        className="card"
        style={{
          width: cardWidth,
          x: springX,
          y: springY,
          rotateX: springRotateX,
          rotateY: springRotateY,
          rotateZ: springRotateZ,
          scale: combinedScale,
          transformPerspective: perspective,
          transformStyle: "preserve-3d",
          transform: "translateZ(0)",
        }}
        animate={isPinching ? {} : { scale: 1 }}
        whileTap={enableDrag ? { scale: hoverScale } : {}}
        drag={enableDrag}
        dragTransition={{
          power: 0.1,
          timeConstant: 700,
          modifyTarget: (target) => Math.round(target * 10) / 10,
        }}
      >
        <motion.div
          style={{
            transform: useTransform(springWheel, wheelTransform),
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FollowCursor;
