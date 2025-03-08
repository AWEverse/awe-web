import { EMediaErrorCode, EMediaReadyState } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import { useState, useEffect, useCallback, useRef } from "react";

const NOTIFICATION_DURATION = 8000;

export default function useUnsupportedMedia(
  ref: React.RefObject<HTMLVideoElement | null>,
  isDisabled?: boolean,
  shouldDisableNotification?: boolean,
) {
  const [isUnsupported, setIsUnsupported] = useState(false);
  const mediaSourceRef = useRef<string>("");
  const errorCheckedRef = useRef(false);

  const checkMediaSupport = useStableCallback(() => {
    const video = ref.current;
    if (!video) return false;

    // Check MIME type support proactively
    if (video.src && mediaSourceRef.current !== video.src) {
      mediaSourceRef.current = video.src;
      const mimeType = getVideoMimeType(video.src);
      if (mimeType && !video.canPlayType(mimeType)) {
        return true;
      }
    }

    // Check dimensions after metadata
    return (
      video.readyState >= EMediaReadyState.HAVE_CURRENT_DATA &&
      (!video.videoHeight || !video.videoWidth)
    );
  });

  const handleUnsupported = useStableCallback((permanent = false) => {
    if (isUnsupported || errorCheckedRef.current) return;

    const isReallyUnsupported = checkMediaSupport() || permanent;
    if (!isReallyUnsupported) return;

    errorCheckedRef.current = true;
    setIsUnsupported(true);

    if (!shouldDisableNotification) {
      showSupportNotification();
    }
  });

  const onError = useStableCallback((event: Event) => {
    const target = event.currentTarget as HTMLVideoElement;
    const error = target.error;

    if (!error) return;

    const isFatalError = [
      EMediaErrorCode.MEDIA_ERR_DECODE,
      EMediaErrorCode.MEDIA_ERR_SRC_NOT_SUPPORTED,
      EMediaErrorCode.MEDIA_ERR_NETWORK,
    ].includes(error.code);

    handleUnsupported(isFatalError);
  });

  const onLoadedMetadata = useStableCallback(() => {
    handleUnsupported();
  });

  const onCanPlayThrough = useStableCallback(() => {
    errorCheckedRef.current = false;
  });

  useEffect(() => {
    if (isDisabled || !ref.current) return;

    const video = ref.current;
    const handlers = {
      error: onError,
      loadedmetadata: onLoadedMetadata,
      canplaythrough: onCanPlayThrough,
      suspend: onCanPlayThrough,
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    // Initial check for cached media
    if (video.readyState > EMediaReadyState.HAVE_NOTHING) {
      handleUnsupported();
    }

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [isDisabled, ref.current]);

  return isUnsupported;
}

// Helper functions
function getVideoMimeType(src: string): string | null {
  const extension = src.split(".").pop()?.split(/[#?]/)[0];
  if (!extension) return null;

  const mimeTypes = {
    mp4: "video/mp4",
    webm: "video/webm",
    ogv: "video/ogg",
    m3u8: "application/vnd.apple.mpegurl",
    mpd: "application/dash+xml",
  };

  return mimeTypes[extension as keyof typeof mimeTypes] || null;
}

function showSupportNotification() {
  // Unified notification logic
  // showNotification({
  //   message: IS_MOBILE
  //     ? formatMessage('Video.Unsupported.Mobile')
  //     : formatMessage('Video.Unsupported.Desktop'),
  //   duration: NOTIFICATION_DURATION,
  // });
}
