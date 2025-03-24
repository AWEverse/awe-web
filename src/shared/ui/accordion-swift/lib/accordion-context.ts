import { createContext, useContext } from "react";

export type AccordionContextType = {
  openIndexes: readonly number[];
  toggleIndex: (index: number) => void;
  allowMultiple: boolean;
  childCount: number;
};

export const AccordionContext = createContext<AccordionContextType | null>(null);

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("useAccordionContext must be used within an AccordionSwiftGroup");
  }
  return context;
};
