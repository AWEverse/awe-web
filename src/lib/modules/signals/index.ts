import { createCallbackManager } from '../../utils/callbacks';
import { SignalState, ReactiveSignal, SIGNAL_MARK } from './types';

// Global map to store unsubscribe functions for each effect
const effectUnsubscribeMap = new Map<NoneToVoidFunction, Set<NoneToVoidFunction>>();
let currentActiveEffect: NoneToVoidFunction | undefined;

// Helper functions to access the global effect map
export const getEffectUnsubscribeMap = () => effectUnsubscribeMap;
export const getCurrentActiveEffect = () => currentActiveEffect;

// Signal creation function
export function createSignal<T>(initialValue?: T) {
  const signalState: SignalState<typeof initialValue> = {
    value: initialValue,
    effectCallbacks: createCallbackManager(),
  };

  // Subscribe an effect to the signal
  function onChange(effectCallback: NoneToVoidFunction) {
    const unsubscribeCallback = signalState.effectCallbacks.addCallback(effectCallback);

    let unsubscribeSet = effectUnsubscribeMap.get(effectCallback);

    if (!unsubscribeSet) {
      unsubscribeSet = new Set();
      effectUnsubscribeMap.set(effectCallback, unsubscribeSet);
    }

    unsubscribeSet.add(unsubscribeCallback);

    return () => {
      unsubscribeCallback();
      unsubscribeSet.delete(unsubscribeCallback);

      if (unsubscribeSet.size === 0) {
        effectUnsubscribeMap.delete(effectCallback);
      }
    };
  }

  // Subscribe an effect for only the first time
  function onChangeOnce(effectCallback: NoneToVoidFunction) {
    const unsubscribeCallback = onChange(() => {
      unsubscribeCallback();
      effectCallback();
    });

    return unsubscribeCallback;
  }

  // Getter for the signal's value, tracking current active effect if needed
  function get() {
    if (currentActiveEffect) {
      onChange(currentActiveEffect);
    }

    return signalState.value;
  }

  // Setter for updating the signal's value
  function set(newValue: T) {
    if (signalState.value !== newValue) {
      signalState.value = newValue;
      signalState.effectCallbacks.runCallbacks();
    }
  }

  // The signal object with get, set, onChange, and onChangeOnce methods
  const signal = Object.assign(get as ReactiveSignal<T>, {
    onChange,
    onChangeOnce,
    [SIGNAL_MARK]: SIGNAL_MARK,
  });

  return [signal, set] as const;
}

// Cleanup function for unsubscribing from all effects related to a specific effect callback
export function removeEffectSubscriptions(effectCallback: NoneToVoidFunction) {
  const unsubscribeCallbacks = effectUnsubscribeMap.get(effectCallback);

  unsubscribeCallbacks?.forEach(unsubscribe => {
    unsubscribe();
  });

  effectUnsubscribeMap.delete(effectCallback);
}
