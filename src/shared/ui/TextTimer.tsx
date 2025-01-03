import useInterval from '@/lib/hooks/shedulers/useInterval';
import useForceUpdate from '@/lib/hooks/state/useForceUpdate';
import { FC, useEffect, memo, useMemo } from 'react';
import { getServerTime } from '../lib/serverTime';

type OwnProps = {
  langKey: string;
  endsAt: number;
  onEnd?: NoneToVoidFunction;
};

const UPDATE_FREQUENCY = 500;

function calculateTimeLeft(endsAt: number, serverTime: number) {
  let timeLeft = endsAt - serverTime;

  if (timeLeft <= 0) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return { hours, minutes, seconds };
}

const TextTimer: FC<OwnProps> = ({ endsAt, onEnd }) => {
  const forceUpdate = useForceUpdate();
  const serverTime = getServerTime();
  const isActive = serverTime < endsAt;

  useInterval(forceUpdate, isActive ? UPDATE_FREQUENCY : undefined);

  const timeLeft = useMemo(() => calculateTimeLeft(endsAt, serverTime), [endsAt, serverTime]);

  useEffect(() => {
    if (!isActive) {
      onEnd?.();
    }
  }, [isActive, onEnd]);

  if (!timeLeft) return null;

  const { hours, minutes, seconds } = timeLeft;

  return (
    <span>{`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</span>
  );
};

export default memo(TextTimer);
