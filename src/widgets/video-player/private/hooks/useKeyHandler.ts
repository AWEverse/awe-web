import { EKeyboardKey } from '@/lib/core';
import { useComponentDidMount } from '@/shared/hooks/effects/useLifecycle';
import { useEffect } from 'react';


type KeyboardKey = `${EKeyboardKey}`;

type KeyMapping = {
  readonly [key in KeyboardKey]?: (e: KeyboardEvent) => void;
}

interface Options {
  readonly shouldHandle?: (e: KeyboardEvent) => boolean;
}

/**
 * A generic hook for capturing keyboard events and mapping them to handlers.
 * @param mapping An object mapping key codes (e.g., 'Space', 'ArrowLeft') to handler functions.
 * @param options Optional configuration, including a custom condition for handling key presses.
 */
function useKeyHandler(mapping: KeyMapping, options: Options = {}) {
  const { shouldHandle = (e) => !(e.target instanceof HTMLInputElement) } = options;

  useComponentDidMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!shouldHandle(e)) {
        return;
      }

      const handler = mapping[e.code as KeyboardKey];

      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });
}

export default useKeyHandler;
