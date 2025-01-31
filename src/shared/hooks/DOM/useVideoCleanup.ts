import { useEffect } from "react";
import { onIdleComplete } from "@/lib/core";
import unloadVideo from "@/lib/utils/unloadVideo";

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
    if (!videoEl) {
      return undefined;
    }

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

      // Postpone unloading the video until idle
      onIdleComplete(() => {
        unloadVideo(videoEl);
      });
    };
  }, [handlers, videoRef]);
}

export function resolveEventType(propName: string, element: Element) {
  const eventType = propName
    .replace(/^on/, "")
    .replace(/Capture$/, "")
    .toLowerCase();

  if (eventType === "change" && element.tagName !== "SELECT") {
    // React behavior repeated here.
    // https://stackoverflow.com/questions/38256332/in-react-whats-the-difference-between-onchange-and-oninput
    return "input";
  }

  if (eventType === "doubleclick") {
    return "dblclick";
  }

  // Replace focus/blur by their "bubbleable" versions
  if (eventType === "focus") {
    return "focusin";
  }

  if (eventType === "blur") {
    return "focusout";
  }

  return eventType;
}
