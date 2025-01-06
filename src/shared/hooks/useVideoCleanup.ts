import { onIdleComplete } from '@/lib/core';
import { useStateRef } from '@/lib/hooks/state/useStateRef';
import unloadVideo from '@/lib/utils/unloadVideo';
import { useLayoutEffect } from 'react';

export default function useVideoCleanup(
  videoRef?: React.RefObject<HTMLVideoElement | null>,
  handlers?: Record<string, AnyFunction>,
) {
  const handlersRef = useStateRef(handlers);

  useLayoutEffect(() => {
    const videoEl = videoRef?.current;
    if (!videoEl) return undefined;

    return () => {
      const handlers = handlersRef.current;

      if (handlers) {
        Object.entries(handlers).forEach(([eventName, handler]) => {
          videoEl.removeEventListener(resolveEventType(eventName, videoEl), handler, false);
        });
      }

      // specifically on iOS, we postpone it after unmounting
      onIdleComplete(() => {
        unloadVideo(videoEl);
      });
    };
  }, [handlersRef, videoRef]);
}

export function resolveEventType(propName: string, element: Element) {
  const eventType = propName.replace(/^on|Capture$/, '').toLowerCase();

  // Map React's 'change' event to 'input' for non-SELECT elements
  if (eventType === 'change' && element.tagName !== 'SELECT') {
    return 'input';
  }

  // Return specific event types
  const eventMapping: Record<string, string> = {
    doubleclick: 'dblclick',
    focus: 'focusin',
    blur: 'focusout',
  };

  return eventMapping[eventType] || eventType;
}
