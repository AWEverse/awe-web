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

  enterDuration = 0.25,
  exitDuration = 0.25,
  delay = 0,
  type = "spring",
  ease = "easeOut",
  stiffness = 300,
  damping = 30,
  mass = 0.8,
}: SlideInOptions = {}): Variants {
  const parseDistance = (val: number | string) =>
    typeof val === "number" ? `${val}${typeof val === "number" ? "%" : ""}` : val;

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
      visible: { opacity: 1, transition: { duration: 0.125 } },
      exit: { opacity: 0, transition: { duration: 0.125 } },
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

export const SLIDE_LEFT = slideInVariant({ direction: "left", distance: "100%" });
export const SLIDE_RIGHT = slideInVariant({ direction: "right", distance: "100%" });
export const SLIDE_TOP = slideInVariant({ direction: "top", distance: "100%" });
export const SLIDE_BOTTOM = slideInVariant({ direction: "bottom", distance: "100%" });
