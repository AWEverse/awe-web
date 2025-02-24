import { ReactNode } from "react";

export interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  className?: string;
  onToggle?: (index: number) => void;
  index?: number;

  _isFirstChild?: boolean;
  _isLastChild?: boolean;
  _isNextChild?: boolean;
  _isPrevChild?: boolean;
  _isSingleChild?: boolean;
}

export interface AccordionGroupProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultOpenIndexes?: number[];
  className?: string;
}
