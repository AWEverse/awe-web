import { DEBUG } from "@/lib/config/dev";
import { isMediaPlaying, playMedia } from "@/lib/core";
import { useState, useLayoutEffect, useCallback, useRef } from "react";

type PipState = {
  isSupported: boolean;
  isActive: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
};

const PIP_EVENTS = [
  "enterpictureinpicture",
  "webkitenterpictureinpicture",
  "leavepictureinpicture",
  "webkitleavepictureinpicture",
] as const;

export default function usePictureInPicture(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  callbacks?: {
    onEnter?: () => void;
    onLeave?: () => void;
  },
): PipState {
  const [state, setState] = useState<PipState>({
    isSupported: false,
    isActive: false,
    enter: () => Promise.resolve(),
    exit: () => Promise.resolve(),
  });

  const pipElement = useRef<HTMLVideoElement | null>(null);

  // Feature detection
  const isPipSupported = useCallback(() => {
    const video = videoRef.current;
    return !!(
      (document.pictureInPictureEnabled ||
        video?.webkitSupportsPresentationMode?.("picture-in-picture")) &&
      !video?.disablePictureInPicture
    );
  }, [videoRef]);

  const handleEnter = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true }));
    callbacks?.onEnter?.();
  }, [callbacks?.onEnter]);

  const handleLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: false }));
    callbacks?.onLeave?.();
  }, [callbacks?.onLeave]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video || !isPipSupported()) return;

    const handlePipEvent = (event: Event) => {
      event.type.includes("enter") ? handleEnter() : handleLeave();
    };

    PIP_EVENTS.forEach((event) => {
      video.addEventListener(event, handlePipEvent);
    });

    setState((prev) => ({
      ...prev,
      isSupported: true,
      isActive: !!document.pictureInPictureElement,
    }));

    return () => {
      PIP_EVENTS.forEach((event) => {
        video.removeEventListener(event, handlePipEvent);
      });
    };
  }, [videoRef, isPipSupported, handleEnter, handleLeave]);

  const enterPip = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isPipSupported()) return;

    try {
      const wasPlaying = isMediaPlaying(video);

      if (video.webkitSetPresentationMode) {
        video.webkitSetPresentationMode("picture-in-picture");
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      } else if (video.webkitRequestPictureInPicture) {
        await video.webkitRequestPictureInPicture();
      }

      pipElement.current = video;
      if (wasPlaying) await playMedia(video);
    } catch (error) {
      DEBUG && console.error("PIP enter failed:", error);
    }
  }, [videoRef, isPipSupported]);

  const exitPip = useCallback(async () => {
    try {
      if (pipElement.current?.webkitSetPresentationMode) {
        pipElement.current.webkitSetPresentationMode("inline");
      } else if (document.exitPictureInPicture) {
        await document.exitPictureInPicture();
      } else if (document.webkitExitPictureInPicture) {
        await document.webkitExitPictureInPicture();
      }
      pipElement.current = null;
    } catch (error) {
      DEBUG && console.error("PIP exit failed:", error);
    }
  }, []);

  useLayoutEffect(() => {
    setState((prev) => ({
      ...prev,
      enter: enterPip,
      exit: exitPip,
    }));
  }, [enterPip, exitPip]);

  return state;
}
