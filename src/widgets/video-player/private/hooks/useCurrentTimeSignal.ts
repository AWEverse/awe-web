import useEffectOnce from '@/lib/hooks/effects/useEffectOnce';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import useSignal from '@/lib/hooks/signals/useSignal';

const useCurrentTimeSignal = () => {
  const currentTime = useSignal(0);

  const setCurrentTime = useLastCallback((time: number) => {
    currentTime.value = time;
  });

  useEffectOnce(() => {
    () => {
      setCurrentTime(0);
    };
  });

  return [currentTime, setCurrentTime] as const;
};

export default useCurrentTimeSignal;
