import { ReactNode } from 'react';

export interface WithDecorators<TStartDecorator = ReactNode, TEndDecorator = ReactNode> {
  startDecorator?: TStartDecorator;
  endDecorator?: TEndDecorator;
}

export interface WithShared {
  className?: string;
  children?: ReactNode;
}
