import { ReadonlySignal } from "@/lib/core/public/signals";
import React, { memo, useCallback, useSyncExternalStore } from "react";

interface SignalFragmentProps<T> {
  signal: ReadonlySignal<T>;
  children: (value: T) => React.ReactNode;
}

const SignalFragment = <T,>({
  signal,
  children,
}: SignalFragmentProps<T>): React.ReactNode => {
  const subscribe = useCallback(
    (callback: () => void) => signal.subscribe(callback),
    [signal],
  );

  const getSnapshot = useCallback(() => signal.value, [signal]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return <React.Fragment>{children(value)}</React.Fragment>;
};

SignalFragment.displayName = "SignalFragment";

function createSignalFragment<T>(signal: ReadonlySignal<T>) {
  return (props: Omit<SignalFragmentProps<T>, "signal">) => (
    <SignalFragment signal={signal} {...props} />
  );
}

export { createSignalFragment };
export default memo(SignalFragment);
