import useEffectOnce from '@/lib/hooks/effects/useEffectOnce';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import useSignal from '@/lib/hooks/signals/useSignal';

const useCurrentTimeSignal = () => {
  const currentTime = useSignal(false);

  const setCurrentTime = useLastCallback((time: boolean) => {
    currentTime.value = time;
  });

  useEffectOnce(() => {
    () => {
      setCurrentTime(false);
    };
  });

  return [currentTime, setCurrentTime] as const;
};

export default useCurrentTimeSignal;
