import { useRef } from "react";
import { CalendarAnimationType } from "../types";

export const useCalendarAnimations = () => {
  return useRef({
    variants: {
      initial: (direction: CalendarAnimationType) => {
        if (direction === "zoomIn") {
          return { scale: 0.8, opacity: 0, y: 20 };
        }
        return {
          x: direction === "RTL" ? "100%" : direction === "LTR" ? "-100%" : 0,
          opacity: 1,
          scale: 0.95,
        };
      },
      animate: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: "easeInOut" },
      },
      exit: (direction: CalendarAnimationType) => {
        if (direction === "zoomIn") {
          return {
            scale: 0.8,
            opacity: 0,
            y: -20,
            transition: { duration: 0.25, ease: "easeInOut" },
          };
        }
        return {
          x: direction === "RTL" ? "-100%" : "100%",
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.2, ease: "easeInOut" },
        };
      },
    },
  }).current;
}
