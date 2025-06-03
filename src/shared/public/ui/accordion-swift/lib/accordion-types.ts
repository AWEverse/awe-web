import { ElementType, ReactNode } from "react";

export interface AccordionItemProps {
  as?: string;
  title?: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  className?: string;
  onToggle?: (index: number) => void;
  index?: number;
}

export interface AccordionGroupProps {
  as?: ElementType;
  children: ReactNode;
  allowMultiple?: boolean;
  defaultOpenIndexes?: number[];
  className?: string;
}
