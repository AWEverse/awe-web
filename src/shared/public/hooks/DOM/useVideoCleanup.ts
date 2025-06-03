import { useEffect } from "react";
import { onIdleComplete } from "@/lib/core";
import unloadVideo from "@/lib/utils/unloadVideo";
import { useComponentWillUnmount } from "../effects/useLifecycle";

/**
 * Custom hook to manage video cleanup by removing event listeners and unloading video resources.
 * @param {React.RefObject<HTMLVideoElement | null>} videoRef - Reference to the video element.
 * @param {Record<string, Function>} handlers - Optional event handlers to be attached to the video element.
 */
export default function useVideoCleanup(
  videoRef?: React.RefObject<HTMLVideoElement | null>,
  handlers?: Record<string, AnyFunction>,
) {
  useEffect(() => {
    const videoEl = videoRef?.current;
    if (!videoEl) return;

    if (handlers) {
      Object.entries(handlers).forEach(([eventName, handler]) => {
        const eventType = resolveEventType(eventName, videoEl);
        videoEl.addEventListener(eventType, handler, false);
      });
    }

    return () => {
      if (handlers) {
        Object.entries(handlers).forEach(([eventName, handler]) => {
          const eventType = resolveEventType(eventName, videoEl);
          videoEl.removeEventListener(eventType, handler, false);
        });
      }
    };
  }, [handlers, videoRef]);

  useComponentWillUnmount(() => {
    const videoEl = videoRef?.current;

    if (videoEl) {
      onIdleComplete(() => {
        unloadVideo(videoEl);
      });
    }
  });
}

export function resolveEventType(propName: string, element: HTMLElement) {
  const eventType = propName
    .replace(/^on/, "")
    .replace(/Capture$/, "")
    .toLowerCase();

  if (eventType === "change" && element.tagName !== "SELECT") {
    return "input";
  }

  if (eventType === "doubleclick") {
    return "dblclick";
  }

  if (eventType === "focus") {
    return "focusin";
  }

  if (eventType === "blur") {
    return "focusout";
  }

  return eventType;
}
