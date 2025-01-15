import { EMediaErrorCode } from '@/lib/core';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { useState, useEffect, useCallback } from 'react';

const NOTIFICATION_DURATION = 8000;

export default function useUnsupportedMedia(
  ref: React.RefObject<HTMLVideoElement | null>,
  isDisabled?: boolean,
  shouldDisableNotification?: boolean,
) {
  const [isUnsupported, setIsUnsupported] = useState(false);

  const handleUnsupported = useCallback(() => {
    if (!isUnsupported) {
      setIsUnsupported(true);
      if (!shouldDisableNotification) {
        // showNotification({
        //   message: IS_MOBILE
        //     ? formatMessage('Video.Unsupported.Mobile')
        //     : formatMessage('Video.Unsupported.Desktop'),
        //   duration: NOTIFICATION_DURATION,
        // });
      }
    }
  }, [isUnsupported, shouldDisableNotification]);

  const onError = useCallback(
    (event: Event) => {
      const target = event.currentTarget as HTMLVideoElement;
      const { error } = target;
      if (error) {
        // Check error codes for unsupported media
        if (
          error.code === EMediaErrorCode.MEDIA_ERR_DECODE ||
          error.code === EMediaErrorCode.MEDIA_ERR_SRC_NOT_SUPPORTED
        ) {
          handleUnsupported();
        }
      }
    },
    [handleUnsupported],
  );

  const onCanPlay = useCallback(
    (event: Event) => {
      const target = event.currentTarget as HTMLVideoElement;
      if (!target.videoHeight || !target.videoWidth) {
        handleUnsupported();
      }
    },
    [handleUnsupported],
  );

  useEffect(() => {
    if (isDisabled || !ref.current) return;

    const currentVideo = ref.current;
    currentVideo.addEventListener('error', onError);
    currentVideo.addEventListener('canplay', onCanPlay);

    return () => {
      currentVideo.removeEventListener('error', onError);
      currentVideo.removeEventListener('canplay', onCanPlay);
    };
  }, [isDisabled, ref, onError, onCanPlay]);

  return isUnsupported;
}
