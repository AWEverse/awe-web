import { IS_IOS, IS_REQUEST_FULLSCREEN_SUPPORTED } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import React, { useState, useLayoutEffect, useCallback } from "react";

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

  const handleFullscreenChange = useStableCallback(() => {
    const newState = checkIfFullscreen();
    setIsFullscreen(newState);

    if (newState) {
      callbacks?.onEnter?.();
      // Force controls in fullscreen for Firefox
      if (elRef.current instanceof HTMLVideoElement) {
        elRef.current.controls = true;
      }
    } else {
      callbacks?.onExit?.();
    }
  });

  // Event listeners setup
  useLayoutEffect(() => {
    if (!isSupported) return;

    const element = elRef.current;
    const handlers = {
      fullscreen: handleFullscreenChange,
      iosStart: () => callbacks?.onEnter?.(),
      iosEnd: () => callbacks?.onExit?.(),
    };

    // Add standard fullscreen listeners
    FULLSCREEN_EVENTS.forEach((event) => {
      document.addEventListener(event, handlers.fullscreen);
    });

    // Add iOS-specific listeners
    if (IS_IOS && element) {
      IOS_FULLSCREEN_EVENTS.forEach((event, idx) => {
        element.addEventListener(
          event,
          [handlers.iosStart, handlers.iosEnd][idx],
        );
      });
    }

    return () => {
      FULLSCREEN_EVENTS.forEach((event) => {
        document.removeEventListener(event, handlers.fullscreen);
      });

      if (IS_IOS && element) {
        IOS_FULLSCREEN_EVENTS.forEach((event, idx) => {
          element.removeEventListener(
            event,
            [handlers.iosStart, handlers.iosEnd][idx],
          );
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
      console.error("Failed to enter fullscreen:", error);
    }
  }, [elRef, isFullscreen]);

  const exitFullscreen = useCallback(async () => {
    if (!isFullscreen) return;

    try {
      await requestExitFullscreen();
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    await (isFullscreen ? exitFullscreen?.() : setFullscreen?.());
  };

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

// Helper functions
function checkIfFullscreen(): boolean {
  return isSupported && Boolean(document[fullscreenProp as keyof Document]);
}

async function requestFullscreen(element: HTMLElement) {
  const request =
    element.requestFullscreen?.bind(element) ||
    element.webkitRequestFullscreen?.bind(element) ||
    element.mozRequestFullScreen?.bind(element);

  if (request) await request();
}

async function requestExitFullscreen() {
  const exit =
    document.exitFullscreen?.bind(document) ||
    document.webkitExitFullscreen?.bind(document) ||
    document.mozCancelFullScreen?.bind(document);

  if (exit) await exit();
}
