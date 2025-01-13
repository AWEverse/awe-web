import { DEBUG } from '@/lib/config/dev';
import { clamp01 } from '../math';

// Enum representing the readyState property of HTMLMediaElement
export enum EMediaReadyState {
  HAVE_NOTHING = 0, // No information is available about the media resource.
  HAVE_METADATA = 1, // Enough of the media resource has been retrieved that the metadata attributes are initialized.
  HAVE_CURRENT_DATA = 2, // Data is available for the current playback position, but not enough to actually play more than one frame.
  HAVE_FUTURE_DATA = 3, // Data for the current playback position as well as for at least a little bit of time into the future is available.
  HAVE_ENOUGH_DATA = 4, // Enough data is available—and the download rate is high enough—that the media can be played through to the end without interruption.
}

export enum EMediaErrorCode {
  MEDIA_ERR_ABORTED = 1,
  MEDIA_ERR_NETWORK = 2,
  MEDIA_ERR_DECODE = 3,
  MEDIA_ERR_SRC_NOT_SUPPORTED = 4,
}

/**
 * Attempts to play the media element, handles errors, and provides more control over playback.
 * @param mediaEl - The media element to play (video or audio).
 * @param options - Optional settings for playback (e.g., handling errors).
 * @returns A Promise that resolves to true if playback starts, or false if an error occurs.
 */
export const playMedia = async (
  mediaEl: HTMLMediaElement,
  options: { onError?: (err: Error) => void } = {},
): Promise<boolean> => {
  if (!mediaEl.paused) {
    return true;
  }

  try {
    await mediaEl.play();
    return true;
  } catch (err) {
    if (options.onError) {
      options.onError(err instanceof Error ? err : new Error(err as string));
    } else if (DEBUG) {
      console.warn('Playback error:', err, mediaEl);
    }
    return false;
  }
};

/**
 * Pauses the media playback and ensures it's only paused if currently playing.
 * @param mediaEl - The media element to pause (video or audio).
 */
export const pauseMedia = (mediaEl: HTMLMediaElement): void => {
  if (!mediaEl.paused) {
    mediaEl.pause();
  }
};

/**
 * Checks if the media is currently playing.
 * @param mediaEl - The media element to check (video or audio).
 * @returns True if the media is playing, false otherwise.
 */
export const isMediaPlaying = (mediaEl: HTMLMediaElement): boolean => {
  return (
    !mediaEl.paused && !mediaEl.ended && mediaEl.readyState > EMediaReadyState.HAVE_CURRENT_DATA
  );
};

/**
 * Checks if the media has enough data to start playing.
 * @param mediaEl - The media element to check (video or audio).
 * @returns True if the media is ready to play, false otherwise.
 */
export const isMediaReadyToPlay = (mediaEl: HTMLMediaElement): boolean => {
  return mediaEl.readyState >= EMediaReadyState.HAVE_FUTURE_DATA;
};

/**
 * Retrieves the total duration of the media.
 * @param mediaEl - The media element to check (video or audio).
 * @returns The duration of the media in seconds.
 */
export const getMediaDuration = (mediaEl: HTMLMediaElement): number => {
  return mediaEl.duration;
};

/**
 * Retrieves the current playback time of the media.
 * @param mediaEl - The media element to check (video or audio).
 * @returns The current playback time in seconds.
 */
export const getCurrentPlaybackTime = (mediaEl: HTMLMediaElement): number => {
  return mediaEl.currentTime;
};

/**
 * Sets the volume of the media with optional smooth transition.
 * @param mediaEl - The media element to adjust (video or audio).
 * @param volume - The target volume level (0.0 to 1.0).
 * @param duration - Optional duration (in milliseconds) for a smooth volume transition.
 */
export const setMediaVolume = (
  mediaEl: HTMLMediaElement,
  volume: number = 1,
  duration: number = 0,
): void => {
  const targetVolume = clamp01(volume);

  if (duration > 0) {
    const startVolume = mediaEl.volume;
    const delta = targetVolume - startVolume;
    const stepTime = 50;
    const steps = Math.ceil(duration / stepTime);
    let currentStep = 0;

    const intervalId = setInterval(() => {
      currentStep++;
      mediaEl.volume = clamp01(startVolume + (delta * currentStep) / steps);

      if (currentStep >= steps) {
        clearInterval(intervalId);
      }
    }, stepTime);
  } else {
    mediaEl.volume = targetVolume;
  }
};

/**
 * Mutes or unmutes the media, with optional smooth transition.
 * @param mediaEl - The media element to adjust (video or audio).
 * @param mute - True to mute, false to unmute.
 * @param fadeDuration - Optional duration (in milliseconds) for smooth fade out or fade in.
 */
export const setMediaMute = (
  mediaEl: HTMLMediaElement,
  mute: boolean = true,
  fadeDuration: number = 0,
): void => {
  if (mute) {
    mediaEl.dataset.previousVolume = String(mediaEl.volume);
    setMediaVolume(mediaEl, 0, fadeDuration);
    mediaEl.muted = true;
  } else {
    const previousVolume = parseFloat(mediaEl.dataset.previousVolume || '1');
    mediaEl.muted = false;
    setMediaVolume(mediaEl, previousVolume, fadeDuration);
  }
};
