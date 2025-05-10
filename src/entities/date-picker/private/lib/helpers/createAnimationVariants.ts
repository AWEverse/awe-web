import { SLIDE_LEFT, SLIDE_RIGHT } from "@/shared/animations/slideInVariant";
import { motion } from "framer-motion";

export type CalendarAnimationType = "LTR" | "RTL" | "zoom";

SLIDE_RIGHT
SLIDE_LEFT


export const createAnimationVariants = (
  direction: "LTR" | "RTL" | "zoom" = "LTR"
): {
  slide: {
    initial: (animated: CalendarAnimationType) => any;
    animate: any;
    exit: (animated: CalendarAnimationType) => any;
  };
  zoom: {
    initial: any;
    animate: any;
    exit: (animated: CalendarAnimationType) => any;
  };
} => {
  return {
    slide: {
      initial: (animated: CalendarAnimationType) => ({
        x: animated === "RTL" ? "100%" : animated === "LTR" ? "-100%" : 0,
        opacity: 1,
        scale: 0.95,
      }),
      animate: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: "easeInOut" },
      },
      exit: (animated: CalendarAnimationType) =>
        animated === "zoom"
          ? {
            scale: 0.8,
            opacity: 0,
            y: -20,
            transition: { duration: 0.25, ease: "easeInOut" },
          }das
        : {
        x: animated === "RTL" ? "-100%" : "100%",
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2, ease: "easeInOut" },
      },
    },
    zoom: {
      initial: { scale: 0.8, opacity: 0, y: 20 },
      animate: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: "easeInOut" },
      },
      exit: (animated: CalendarAnimationType) =>
        animated === "zoom"
          ? {
            scale: 0.8,
            opacity: 0,
            y: -20,
            transition: { duration: 0.25, ease: "easeInOut" },
          }
          : {
            x: animated === "RTL" ? "-100%" : "100%",
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeInOut" },
          },
    },
  };
};
