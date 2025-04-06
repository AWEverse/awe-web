import { SignalLifecycle } from "./effects";

export interface SignalErrorHandler<T> {
  onError: (error: unknown) => void;
  fallback?: T;
}

export interface SignalConfig<T> {
  initialValue: T;
  lifecycle?: SignalLifecycle<T>;
  errorHandler?: SignalErrorHandler<T>;
  lazy?: boolean;
}

export interface Subscription<T> {
  next: (value: T) => void;
  error?: (error: unknown) => void;
  complete?: () => void;
}
