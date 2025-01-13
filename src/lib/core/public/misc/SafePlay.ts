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
 * Attempts to play the media element and handles any errors.
 * @param mediaEl - The media element to play (video or audio).
 */
export const playMedia = (mediaEl: HTMLMediaElement): void => {
  mediaEl.play().catch(err => {
    if (DEBUG) {
      console.warn(err, mediaEl);
    }
  });
};

/**
 * Pauses the media playback.
 * @param mediaEl - The media element to pause (video or audio).
 */
export const pauseMedia = (mediaEl: HTMLMediaElement): void => {
  mediaEl.pause();
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
 * Sets the volume of the media.
 * @param mediaEl - The media element to adjust (video or audio).
 * @param volume - The volume level (0.0 to 1.0).
 */
export const setMediaVolume = (mediaEl: HTMLMediaElement, volume: number): void => {
  mediaEl.volume = clamp01(volume); // Ensure volume is between 0 and 1
};

/**
 * Mutes or unmutes the media.
 * @param mediaEl - The media element to adjust (video or audio).
 * @param mute - True to mute, false to unmute.
 */
export const setMediaMute = (mediaEl: HTMLMediaElement, mute: boolean): void => {
  mediaEl.muted = mute;
};
