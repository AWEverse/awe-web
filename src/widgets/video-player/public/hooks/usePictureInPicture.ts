import { DEBUG } from "@/lib/config/dev";
import {
  IS_FIREFOX,
  IS_IOS,
  IS_PWA,
  isMediaPlaying,
  playMedia,
} from "@/lib/core";
import { useState, useLayoutEffect, useCallback } from "react";

type RefType = {
  current: HTMLVideoElement | null;
};

type ReturnType = [boolean, () => void, boolean] | [false];
type CallbackType = () => void;

export default function usePictureInPicture(
  elRef: RefType,
  onEnter: CallbackType,
  onLeave: CallbackType,
): ReturnType {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  if (IS_FIREFOX) {
    return [false];
  }
  // const IsPictureInPicture = useSignal();

  useLayoutEffect(() => {
    // PIP is not supported in PWA on iOS, despite being detected
    if ((IS_IOS && IS_PWA) || !elRef.current) {
      return undefined;
    }

    const video = elRef.current;
    const setMode = getSetPresentationMode(video);
    const isEnabled =
      (document.pictureInPictureEnabled &&
        !elRef.current?.disablePictureInPicture) ||
      setMode !== undefined;

    if (!isEnabled) {
      return undefined;
    }
    // @ts-ignore
    video.autoPictureInPicture = true;

    setIsSupported(true);

    const onEnterInternal = () => {
      onEnter();
      setIsActive(true);
      // setIsPictureInPicture(true); - signal
    };

    const onLeaveInternal = () => {
      // setIsPictureInPicture(false); - signal
      setIsActive(false);
      onLeave();
    };

    video.addEventListener("enterpictureinpicture", onEnterInternal);
    video.addEventListener("leavepictureinpicture", onLeaveInternal);

    return () => {
      video.removeEventListener("enterpictureinpicture", onEnterInternal);
      video.removeEventListener("leavepictureinpicture", onLeaveInternal);
    };
  }, [elRef, onEnter, onLeave]);

  const exitPictureInPicture = useCallback(() => {
    if (!elRef.current) {
      return;
    }

    const video = elRef.current;
    const setMode = getSetPresentationMode(video);

    if (setMode) {
      setMode("inline");
    } else {
      exitPictureInPictureIfNeeded();
    }
  }, [elRef]);

  const enterPictureInPicture = useCallback(() => {
    if (!elRef.current) {
      return;
    }

    exitPictureInPicture();

    const video = elRef.current;
    const isPlaying = isMediaPlaying(video);
    const setMode = getSetPresentationMode(video);

    if (setMode) {
      setMode("picture-in-picture");
    } else {
      requestPictureInPicture(video);
    }

    if (isPlaying) {
      playMedia(video);
    }
  }, [elRef, exitPictureInPicture]);

  if (!isSupported) {
    return [false];
  }

  return [isSupported, enterPictureInPicture, isActive];
}

function getSetPresentationMode(
  video: HTMLVideoElement,
): ((mode: string) => void) | undefined {
  if ("setPresentationMode" in video) {
    return (
      video as unknown as { setPresentationMode: () => void }
    ).setPresentationMode.bind(video);
  }

  // Check for WebKit-specific presentation mode support
  if (
    "webkitSupportsPresentationMode" in video &&
    typeof (video as unknown as { webkitSetPresentationMode: () => void })
      .webkitSetPresentationMode === "function"
  ) {
    return (
      video as unknown as { webkitSetPresentationMode: () => void }
    ).webkitSetPresentationMode.bind(video);
  }

  // Add checks for other vendor-prefixed versions if they appear in future browsers
  if ("mozSetPresentationMode" in video) {
    return (
      video as unknown as { mozSetPresentationMode: () => void }
    ).mozSetPresentationMode.bind(video);
  }

  return undefined;
}

function requestPictureInPicture(video: HTMLVideoElement) {
  if (video.requestPictureInPicture) {
    try {
      video.requestPictureInPicture();
    } catch (err) {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.log("[MV] PictureInPicture Error", err);
      }
    }
  }
}

export function exitPictureInPictureIfNeeded() {
  if (document.pictureInPictureElement) {
    try {
      document.exitPictureInPicture();
    } catch (err) {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.log("[MV] PictureInPicture Error", err);
      }
    }
  }
}
