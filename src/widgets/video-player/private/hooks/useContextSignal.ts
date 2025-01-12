import useEffectOnce from '@/lib/hooks/effects/useEffectOnce';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import useSignal from '@/lib/hooks/signals/useSignal';

function useContextSignal<T = null>(initialValue: T) {
  const signal = useSignal(initialValue);

  const setSignal = useLastCallback((value: T) => {
    signal.value = value;
  });

  useEffectOnce(() => {
    return () => {
      setSignal(initialValue);
    };
  });

  return [signal, setSignal] as const;
}

export default useContextSignal;
