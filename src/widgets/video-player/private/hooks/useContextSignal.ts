import useEffectOnce from '@/lib/hooks/effects/useEffectOnce';
import useSignal from '@/lib/hooks/signals/useSignal';

function useContextSignal<T = null>(initialValue: T) {
  const signal = useSignal(initialValue);

  const setSignal = (value: T) => {
    signal.value = value;
  };

  return [signal, setSignal] as const;
}

export default useContextSignal;
