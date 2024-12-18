import { CallbackManager } from '@/lib/utils/callbacks';

export interface SignalState<T> {
  value: T;
  effectCallbacks: CallbackManager;
}

export const SIGNAL_MARK: unique symbol = Symbol('SIGNAL_MARK');

export type ReactiveSignal<T = any> = (() => T) & {
  readonly [SIGNAL_MARK]: symbol;
  onChange: (callback: AnyToVoidFunction) => NoneToVoidFunction;
  onChangeOnce: (callback: AnyToVoidFunction) => NoneToVoidFunction;
};

export type SignalSetter<T> = (newValue: T) => void;
