import { ObserveFn } from "@/shared/hooks/DOM/useIntersectionObserver";
import { createContext } from "react";

interface ScrollContextProps {
  observeIntersectionForReading: ObserveFn;
  observeIntersectionForLoading: ObserveFn;
  observeIntersectionForPlaying: ObserveFn;
}

export const ScrollContext = createContext<ScrollContextProps | undefined>(
  undefined,
);
