import { ObserveFn } from "@/shared/hooks/DOM/useIntersectionObserver";
import { createContext } from "react";

interface ScrollContextProps {
  [key: string]: ObserveFn;
}

export const ScrollContext = createContext<ScrollContextProps | undefined>(
  undefined,
);
