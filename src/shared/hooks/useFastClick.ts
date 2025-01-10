import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { EMouseButton, IS_TOUCH_ENV } from '@/lib/core';

type EventArg<E> = React.MouseEvent<E>;
type EventHandler<E> = (e: EventArg<E>) => void;

export function useFastClick<T extends HTMLDivElement | HTMLButtonElement>(
  callback?: EventHandler<T>,
) {
  const handler = useLastCallback((e: EventArg<T>) => {
    if (e.type === 'mousedown' && e.button !== EMouseButton.Main) {
      return;
    }

    callback?.(e);
  });

  return IS_TOUCH_ENV
    ? { handleClick: callback ? handler : undefined }
    : { handleMouseDown: callback ? handler : undefined };
}
