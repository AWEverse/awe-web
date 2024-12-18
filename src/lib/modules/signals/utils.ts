import { ReactiveSignal, SIGNAL_MARK } from './types';

export function isSignal(obj: any): obj is ReactiveSignal {
  return typeof obj === 'function' && SIGNAL_MARK in obj;
}
