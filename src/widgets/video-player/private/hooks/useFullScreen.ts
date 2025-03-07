import { DEBUG } from "@/lib/config/dev";
import { IS_IOS, IS_REQUEST_FULLSCREEN_SUPPORTED } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import React, { useState, useLayoutEffect, useCallback } from "react";

import "@/lib/core/public/polyfill/ScreenOrientation/screenOrientation";

type FullscreenControls = [boolean, () => Promise<void>];

const FULLSCREEN_EVENTS = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "mozfullscreenchange",
] as const;

const IOS_FULLSCREEN_EVENTS = [
  "webkitbeginfullscreen",
  "webkitendfullscreen",
] as const;

const fullscreenProp = (() => {
  if (typeof document === "undefined") return "";
  if ("fullscreenElement" in document) return "fullscreenElement";
  if ("webkitFullscreenElement" in document) return "webkitFullscreenElement";
  if ("mozFullScreenElement" in document) return "mozFullScreenElement";
  return "";
})();

const isSupported =
  Boolean(fullscreenProp || IS_IOS) && IS_REQUEST_FULLSCREEN_SUPPORTED;

export default function useFullscreen(
  elRef: React.RefObject<HTMLElement | null>,
  callbacks?: {
    onEnter?: () => void;
    onExit?: () => void;
  },
): FullscreenControls | [false] {
  const [isFullscreen, setIsFullscreen] = useState(() => checkIfFullscreen());

  const handleFullscreenChange = useStableCallback(async () => {
    const newState = checkIfFullscreen();
    setIsFullscreen(newState);

    if (newState) {
      callbacks?.onEnter?.();
      if (elRef.current instanceof HTMLVideoElement) {
        elRef.current.controls = false; // Force controls in fullscreen for Firefox
      }
    } else {
      callbacks?.onExit?.();
    }
  });

  useLayoutEffect(() => {
    if (!isSupported) return;

    const element = elRef.current;
    const handlers = {
      fullscreen: handleFullscreenChange,
      iosStart: () => callbacks?.onEnter?.(),
      iosEnd: () => callbacks?.onExit?.(),
    };

    FULLSCREEN_EVENTS.forEach((event) => {
      document.addEventListener(event, handlers.fullscreen);
    });

    if (IS_IOS && element) {
      IOS_FULLSCREEN_EVENTS.forEach((event, idx) => {
        element.addEventListener(event, [handlers.iosStart, handlers.iosEnd][idx]);
      });
    }

    return () => {
      FULLSCREEN_EVENTS.forEach((event) => {
        document.removeEventListener(event, handlers.fullscreen);
      });

      if (IS_IOS && element) {
        IOS_FULLSCREEN_EVENTS.forEach((event, idx) => {
          element.removeEventListener(event, [handlers.iosStart, handlers.iosEnd][idx]);
        });
      }
    };
  }, [elRef, callbacks?.onEnter, callbacks?.onExit, handleFullscreenChange]);

  const setFullscreen = useCallback(async () => {
    const element = elRef.current;
    if (!element || isFullscreen) return;

    try {
      await requestFullscreen(element);
    } catch (error) {
      DEBUG && console.error("Failed to enter fullscreen:", error);
    }
  }, [elRef, isFullscreen]);

  const exitFullscreen = useCallback(async () => {
    if (!isFullscreen) return;

    try {
      await requestExitFullscreen();
    } catch (error) {
      DEBUG && console.error("Failed to exit fullscreen:", error);
    }
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    try {
      await (isFullscreen ? exitFullscreen() : setFullscreen());
    } catch (error) {
      DEBUG && console.error("Failed to toggle fullscreen:", error);
    }
  }, [isFullscreen, exitFullscreen, setFullscreen]);

  return isSupported ? [isFullscreen, toggleFullscreen] : [false];
}

export function useFullscreenStatus() {
  const [isFullscreen, setIsFullscreen] = useState(checkIfFullscreen);

  useLayoutEffect(() => {
    if (!isSupported) return;

    const handler = () => setIsFullscreen(checkIfFullscreen);

    FULLSCREEN_EVENTS.forEach((event) => {
      document.addEventListener(event, handler);
    });

    return () => {
      FULLSCREEN_EVENTS.forEach((event) => {
        document.removeEventListener(event, handler);
      });
    };
  }, []);

  return isFullscreen;
}

function checkIfFullscreen(): boolean {
  return isSupported && Boolean(document[fullscreenProp as keyof Document]);
}

async function requestFullscreen(element: PartialHTMLElementSupport): Promise<void> {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen().then(() => {
        // Once in fullscreen, try to lock the screen orientation to landscape
        screen.orientation.lock('landscape').catch(err => {
          console.error('Orientation lock failed:', err);
        });
      });
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
    }
  } catch (error) {
    DEBUG && console.error("Error entering fullscreen:", error);
  }
}

async function requestExitFullscreen(): Promise<void> {
  const _document = document as PartialDocumentSupport;

  try {
    if (screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  } catch {

  }

  try {
    if (_document.exitFullscreen) {
      await _document.exitFullscreen();
    } else if (_document.webkitExitFullscreen) {
      await _document.webkitExitFullscreen();
    } else if (_document.mozCancelFullScreen) {
      await _document.mozCancelFullScreen();
    }
  } catch (error) {
    DEBUG && console.error("Error exiting fullscreen:", error);
  }
}
