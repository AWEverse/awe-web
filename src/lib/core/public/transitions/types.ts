import { ReactNode, RefObject } from 'react';

type RefHandler<
  RefElement extends HTMLElement | undefined,
  Handler extends (...args: any[]) => void,
> = RefElement extends undefined ? (node: HTMLElement, ...args: any[]) => void : Handler;

export type TransitionHandler<
  RefElement extends HTMLElement | undefined,
  Args extends any[] = [],
> = RefHandler<RefElement, (...args: Args) => void>;

export const UNMOUNTED = 'unmounted';
export const EXITED = 'exited';
export const ENTERING = 'entering';
export const ENTERED = 'entered';
export const EXITING = 'exiting';

export interface TransitionActions {
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
}

export interface BaseTransitionProps<RefElement extends HTMLElement | undefined>
  extends TransitionActions {
  in?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  onEnter?: TransitionHandler<RefElement, [HTMLElement, boolean]>;
  onEntering?: TransitionHandler<RefElement, [HTMLElement, boolean]>;
  onEntered?: TransitionHandler<RefElement, [HTMLElement, boolean]>;
  onExit?: TransitionHandler<RefElement, [HTMLElement]>;
  onExiting?: TransitionHandler<RefElement, [HTMLElement]>;
  onExited?: TransitionHandler<RefElement, [HTMLElement]>;
  children?: TransitionChildren;
  nodeRef?: RefObject<RefElement | null> | null;
}

export type TransitionStatus =
  | typeof ENTERING
  | typeof ENTERED
  | typeof EXITING
  | typeof EXITED
  | typeof UNMOUNTED;

export type TransitionChildren =
  | ReactNode
  | ((status: TransitionStatus, childProps?: Record<string, unknown>) => ReactNode);

export interface TimeoutProps<RefElement extends HTMLElement | undefined>
  extends BaseTransitionProps<RefElement> {
  timeout: number | { appear?: number; enter?: number; exit?: number };
  addEndListener?: TransitionHandler<RefElement, [HTMLElement, () => void]>;
}

export interface EndListenerProps<RefElement extends HTMLElement | undefined>
  extends BaseTransitionProps<RefElement> {
  timeout?: number | { appear?: number; enter?: number; exit?: number };
  addEndListener: TransitionHandler<RefElement, [HTMLElement, () => void]>;
}

export type TransitionProps<RefElement extends HTMLElement | undefined = undefined> =
  | TimeoutProps<RefElement>
  | EndListenerProps<RefElement>;

export default TransitionProps;
