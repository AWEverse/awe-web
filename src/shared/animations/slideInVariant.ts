import { Variants, Transition } from "framer-motion";

export type SlideDirection = "left" | "right" | "top" | "bottom";
export type TransitionType = "spring" | "tween" | "inertia";

interface SlideInOptions {
  direction?: SlideDirection;
  distance?: number | string;
  reducedMotion?: boolean;

  enterDuration?: number;
  exitDuration?: number;
  delay?: number;
  type?: TransitionType;
  ease?: string | number[];
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export default function slideInVariant({
  direction = "left",
  distance = "100%",
  reducedMotion = false,

  enterDuration = 0.125, // Shorter enter duration
  exitDuration = 0.125, // Shorter exit duration
  delay = 0,
  type = "tween" as TransitionType, // Default to tween for performance
  ease = "linear", // Simple linear easing
  stiffness = 500, // Tighter spring
  damping = 50, // Higher damping
  mass = 0.5, // Lower mass
}: SlideInOptions = {}): Variants {
  const parseDistance = (val: number | string) =>
    typeof val === "number" ? `${val}%` : val;

  const offsetMap: Record<SlideDirection, { x: string | 0; y: string | 0 }> = {
    left: { x: `-${parseDistance(distance)}`, y: 0 },
    right: { x: parseDistance(distance), y: 0 },
    top: { x: 0, y: `-${parseDistance(distance)}` },
    bottom: { x: 0, y: parseDistance(distance) },
  };

  const offset = offsetMap[direction];

  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.1, // Faster reduced motion transition
          ease: "linear",
        },
      },
      exit: {
        opacity: 0,
        transition: {
          duration: 0.1, // Faster reduced motion transition
          ease: "linear",
        },
      },
    };
  }

  const enterTransition: Transition = {
    type,
    delay,
    duration: type === "tween" ? enterDuration : undefined,
    ease,
    ...(type === "spring" && { stiffness, damping, mass }),
  };

  const exitTransition: Transition = {
    type,
    duration: type === "tween" ? exitDuration : undefined,
    ease,
    ...(type === "spring" && { stiffness, damping, mass }),
  };

  return {
    hidden: {
      opacity: 0,
      ...offset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: enterTransition,
    },
    exit: {
      opacity: 0,
      ...offset,
      transition: exitTransition,
    },
  };
}

// Optimized presets using tween by default
export const SLIDE_LEFT = slideInVariant({
  direction: "left",
  type: "tween",
  enterDuration: 0.125,
  exitDuration: 0.125,
});

export const SLIDE_RIGHT = slideInVariant({
  direction: "right",
  type: "tween",
  enterDuration: 0.125,
  exitDuration: 0.125,
});

export const SLIDE_TOP = slideInVariant({
  direction: "top",
  type: "tween",
  enterDuration: 0.125,
  exitDuration: 0.125,
});

export const SLIDE_BOTTOM = slideInVariant({
  direction: "bottom",
  type: "tween",
  enterDuration: 0.125,
  exitDuration: 0.125,
});
