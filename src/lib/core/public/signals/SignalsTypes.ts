export type Listener<T> = (value: T) => void;

export type Cleanup = () => void;

export type Compute<T> = (oldValue?: T) => T;

export type SignalOptions<T> = {
  equals?: (a: T, b: T) => boolean;
  name?: string;
  debugEnabled?: boolean;
  lazy?: boolean;
};

export type SignalCleanup = {
  unsubscribe: () => void;
  signal: any;
};
