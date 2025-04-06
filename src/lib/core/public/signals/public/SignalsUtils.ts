import { signal, Signal, effect } from "./SignalsCore";
import { SignalConfig } from "../types/utils";

export function createConfiguredSignal<T>(config: SignalConfig<T>): Signal<T> {
  const sig = signal(config.initialValue);

  if (config.lifecycle?.onCreate) {
    config.lifecycle.onCreate(sig);
  }

  if (config.lifecycle?.onUpdate) {
    effect(() => {
      const value = sig.value;
      config.lifecycle!.onUpdate!(value, sig.peek());
    });
  }

  return sig;
}
