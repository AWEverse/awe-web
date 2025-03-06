import { DEBUG } from "@/lib/config/dev";
import { clamp, clamp01 } from "../math";

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
  // Early return if already playing
  if (!mediaEl.paused && !mediaEl.ended) {
    return true;
  }

  try {
    await mediaEl.play();
    return true;
  } catch (err) {
    // Handle AbortError specifically
    const isAbortError =
      err instanceof Error &&
      (err.name === "AbortError" ||
        err.message.includes("interrupted by a call to pause"));

    if (isAbortError) {
      return false; // Expected interruption, no need to log
    }

    // Handle other errors
    const error = err instanceof Error ? err : new Error(String(err));
    options.onError?.(error);
    if (DEBUG && !options.onError) {
      console.warn("Playback error:", error, mediaEl);
    }

    return false;
  }
};

/**
 * Pauses the media playback and ensures it's only paused if currently playing.
 * @param mediaEl - The media element to pause (video or audio).
 */
export const pauseMedia = (mediaEl: HTMLMediaElement): void => {
  const isPlaying = !mediaEl.paused && !mediaEl.ended;

  if (isPlaying) {
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
    !mediaEl.paused &&
    !mediaEl.ended &&
    mediaEl.readyState > EMediaReadyState.HAVE_CURRENT_DATA
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
    const stepTime = 100;
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
): number => {
  const dataset = mediaEl.dataset;
  const currentVolume = mediaEl.volume;

  // Store the previous volume if muted and not already stored
  if (mute) {
    if (!dataset.previousVolume) {
      dataset.previousVolume = currentVolume.toString();
    }
    setMediaVolume(mediaEl, 0, fadeDuration);
  } else {
    const previousVolume = dataset.previousVolume ? +dataset.previousVolume : 1;

    setMediaVolume(mediaEl, previousVolume, fadeDuration);
  }

  mediaEl.muted = mute;
  return dataset.previousVolume ? +dataset.previousVolume : currentVolume;
};

/**
 * List of predefined playback rates.
 */
const RATES = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2];

/**
 * Sets the playback rate of a video element. The rate can be selected from predefined rates or be a custom value.
 *
 * @param {HTMLVideoElement} videoElement - The video element whose playback rate will be adjusted.
 * @param {number} rateIndex - Index of the playback rate from the `RATES` array. If `-1`, the customRate will be used.
 * @param {number} [customRate] - Optional custom rate to set if `CUSTOM_RATE` is true.
 * @returns {void}
 */
export const setMediaPlayBackRate = (
  videoElement: HTMLVideoElement,
  rateIndex: number = 1,
  customRate?: number,
) => {
  if (!videoElement) return;

  if (customRate) {
    videoElement.playbackRate = clamp(customRate, 0.25, 4.0);
    return;
  }

  const validRateIndex = clamp(rateIndex, 0, RATES.length - 1);
  const selectedRate = RATES[validRateIndex];

  videoElement.playbackRate = selectedRate;
};
