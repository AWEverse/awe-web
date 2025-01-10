import { IS_IOS } from '@/lib/core';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import React, { useState, useLayoutEffect, useEffect } from 'react';

type ReturnType = [boolean, () => void, () => void] | [false];
type CallbackType = (isPlayed: boolean) => void;

const prop = getBrowserFullscreenElementProp();

export default function useFullscreen(
  elRef: React.RefObject<HTMLElement | null>,
  exitCallback?: CallbackType,
  enterCallback?: CallbackType,
): ReturnType {
  const [isFullscreen, setIsFullscreen] = useState(checkIfFullscreen());

  const setFullscreen = () => {
    if (!elRef.current || !(prop || IS_IOS) || isFullscreen) {
      return;
    }

    safeRequestFullscreen(elRef.current);
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (!elRef.current) {
      return;
    }

    safeExitFullscreen();
    setIsFullscreen(false);
  };

  useLayoutEffect(() => {
    const element = elRef.current;

    const handleFullscreenChange = () => {
      const isEnabled = checkIfFullscreen();
      setIsFullscreen(isEnabled);

      if (isEnabled) enterCallback?.(true);
      else exitCallback?.(false);

      // Force controls in fullscreen for Firefox
      if (element instanceof HTMLVideoElement) element.controls = isEnabled;
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    if (element) {
      element.addEventListener('webkitbeginfullscreen', () => enterCallback?.(true));
      element.addEventListener('webkitendfullscreen', () => exitCallback?.(false));
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);

      if (element) {
        element.removeEventListener('webkitbeginfullscreen', () => enterCallback?.(true));
        element.removeEventListener('webkitendfullscreen', () => exitCallback?.(false));
      }
    };
  }, [elRef, enterCallback, exitCallback]);

  if (!prop && !IS_IOS) {
    return [false];
  }

  return [isFullscreen, setFullscreen, exitFullscreen];
}

export const useFullscreenStatus = () => {
  const [isFullscreen, setIsFullscreen] = useState(checkIfFullscreen());

  useEffect(() => {
    const handleFullscreenChange = useLastCallback(() => setIsFullscreen(checkIfFullscreen()));

    document.addEventListener('fullscreenchange', handleFullscreenChange, false);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange, false);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange, false);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange, false);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange, false);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange, false);
    };
  }, []);

  return isFullscreen;
};

function getBrowserFullscreenElementProp(): string {
  if ('fullscreenElement' in document) return 'fullscreenElement';
  if ('webkitFullscreenElement' in document) return 'webkitFullscreenElement';
  if ('mozFullScreenElement' in document) return 'mozFullScreenElement';
  return '';
}

export function checkIfFullscreen(): boolean {
  const fullscreenProp = getBrowserFullscreenElementProp();
  return Boolean(fullscreenProp && document[fullscreenProp as keyof Document]);
}

export function safeRequestFullscreen(element: HTMLElement) {
  const _requestFullscreen =
    element.requestFullscreen ??
    element.webkitRequestFullscreen ??
    element.webkitEnterFullscreen ??
    element.mozRequestFullScreen;

  if (_requestFullscreen) {
    _requestFullscreen.call(element);
  } else {
    console.warn('Fullscreen API is not supported by this browser.');
  }
}

export function safeExitFullscreen() {
  const _exitFullscreen =
    document.exitFullscreen ??
    document.mozCancelFullScreen ??
    document.webkitCancelFullScreen ??
    document.webkitExitFullscreen;

  if (_exitFullscreen) {
    _exitFullscreen.call(document);
  } else {
    console.warn('Fullscreen exit API is not supported by this browser.');
  }
}
