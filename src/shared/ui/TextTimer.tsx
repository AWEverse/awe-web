import useInterval from '@/lib/hooks/shedulers/useInterval';
import useForceUpdate from '@/lib/hooks/state/useForceUpdate';
import { FC, useEffect, memo } from 'react';
import { getServerTime } from '../lib/serverTime';

type OwnProps = {
  langKey: string;
  endsAt: number;
  onEnd?: NoneToVoidFunction;
};

const UPDATE_FREQUENCY = 500; // Sometimes second gets skipped if using 1000

function formatMediaDuration(timeLeft: number) {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft - hours * 3600) / 60);
  const seconds = Math.floor(timeLeft - hours * 3600 - minutes * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const TextTimer: FC<OwnProps> = ({ endsAt, onEnd }) => {
  const forceUpdate = useForceUpdate();

  const serverTime = getServerTime();
  const isActive = serverTime < endsAt;

  useInterval(forceUpdate, isActive ? UPDATE_FREQUENCY : undefined);

  useEffect(() => {
    if (!isActive) {
      onEnd?.();
    }
  }, [isActive, onEnd]);

  if (!isActive) return undefined;

  const timeLeft = endsAt - serverTime;
  const formattedTime = formatMediaDuration(timeLeft);

  return <span>{formattedTime}</span>;
};

export default memo(TextTimer);
