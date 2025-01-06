import { IS_IOS } from '@/lib/core';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { useState, useLayoutEffect, useEffect } from 'react';

type ElementType = HTMLElement;
type RefType = { current: ElementType | null };
type ReturnType = [boolean, () => void, () => void] | [false];
type CallbackType = (isPlayed: boolean) => void;

const prop = getBrowserFullscreenElementProp();

export default function useFullscreen(
  elRef: RefType,
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

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return isFullscreen;
};

// Оптимизация функции получения свойства fullscreen
function getBrowserFullscreenElementProp(): string {
  if ('fullscreenElement' in document) return 'fullscreenElement';
  if ('webkitFullscreenElement' in document) return 'webkitFullscreenElement';
  if ('mozFullScreenElement' in document) return 'mozFullScreenElement';
  return '';
}

// Универсальная проверка fullscreen состояния
export function checkIfFullscreen(): boolean {
  const fullscreenProp = getBrowserFullscreenElementProp();
  return Boolean(fullscreenProp && document[fullscreenProp as keyof Document]);
}

// Оптимизация запросов fullscreen
export function safeRequestFullscreen(element: ElementType) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
}

// Оптимизация выхода из fullscreen
export function safeExitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}
