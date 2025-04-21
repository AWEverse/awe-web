import { Variants, Transition } from "framer-motion";

export type SlideDirection = "left" | "right" | "top" | "bottom";
export type TransitionType = "spring" | "tween" | "inertia" | undefined;

interface SlideInOptions {
  direction?: SlideDirection;
  distance?: number | string;
  reducedMotion?: boolean;

  enterDuration?: number;
  exitDuration?: number;
  delay?: number;
  type?: TransitionType;
  ease?: string | number[] | undefined;
  stiffness?: number;
  damping?: number;
}

export default function slideInVariant({
  direction = "left",
  distance = "100%",
  reducedMotion = false,

  enterDuration = 0.1875,
  exitDuration = 0.1875,
  delay = 0,
  type = "tween",
  ease = "easeOut",
  stiffness,
  damping,
}: SlideInOptions = {}): Variants {
  const parseDistance = (val: number | string) =>
    typeof val === "number" ? `${val}%` : val;

  const offsetMap: Record<SlideDirection, { x: string | 0; y: string | 0 }> = {
    left: { x: `-${parseDistance(distance)}`, y: 0 },
    right: { x: parseDistance(distance), y: 0 },
    top: { x: 0, y: `-${parseDistance(distance)}` },
    bottom: { x: 0, y: parseDistance(distance) },
  };

  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.15 },
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.15 },
      },
    };
  }

  const offset = offsetMap[direction];

  const baseTransition: Transition = {
    type,
    ease,
    duration: enterDuration,
    delay,
    ...(type === "spring" && stiffness ? { stiffness } : {}),
    ...(type === "spring" && damping ? { damping } : {}),
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
      transition: baseTransition,
    },
    exit: {
      opacity: 0,
      ...offset,
      transition: {
        type,
        ease,
        duration: exitDuration,
      },
    },
  };
}

export const RTL_SLIDE = slideInVariant({
  direction: "right",
  distance: 100,
});

export const LTL_SLIDE = slideInVariant({
  direction: "left",
  distance: 100,
});
