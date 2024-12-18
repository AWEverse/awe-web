import { DEBUG } from '@/lib/config/dev';
import { clamp01 } from '@/lib/utils/math';

// Enum representing the readyState property of HTMLMediaElement
export enum EMediaReadyState {
  HAVE_NOTHING = 0, // No information is available about the media resource.
  HAVE_METADATA = 1, // Enough of the media resource has been retrieved that the metadata attributes are initialized.
  HAVE_CURRENT_DATA = 2, // Data is available for the current playback position, but not enough to actually play more than one frame.
  HAVE_FUTURE_DATA = 3, // Data for the current playback position as well as for at least a little bit of time into the future is available.
  HAVE_ENOUGH_DATA = 4, // Enough data is available—and the download rate is high enough—that the media can be played through to the end without interruption.
}

/**
 * Attempts to play the video and handles any errors.
 * @param videoEl - The video element to play.
 */
export const playVideo = (videoEl: HTMLVideoElement): void => {
  videoEl.play().catch(err => {
    // #v-ifdef DEBUG;
    // eslint-disable-next-line no-console
    console.warn(err, videoEl);
    // #v-endif
  });
};

/**
 * Pauses the video playback.
 * @param videoEl - The video element to pause.
 */
export const pauseVideo = (videoEl: HTMLVideoElement): void => {
  videoEl.pause();
};

/**
 * Checks if the video is currently playing.
 * @param videoEl - The video element to check.
 * @returns True if the video is playing, false otherwise.
 */
export const isVideoPlaying = (videoEl: HTMLVideoElement): boolean => {
  return (
    !videoEl.paused && !videoEl.ended && videoEl.readyState > EMediaReadyState.HAVE_CURRENT_DATA
  );
};

/**
 * Checks if the video has enough data to start playing.
 * @param videoEl - The video element to check.
 * @returns True if the video is ready to play, false otherwise.
 */
export const isVideoReadyToPlay = (videoEl: HTMLVideoElement): boolean => {
  return videoEl.readyState >= EMediaReadyState.HAVE_FUTURE_DATA;
};

/**
 * Retrieves the total duration of the video.
 * @param videoEl - The video element to check.
 * @returns The duration of the video in seconds.
 */
export const getVideoDuration = (videoEl: HTMLVideoElement): number => {
  return videoEl.duration;
};

/**
 * Retrieves the current playback time of the video.
 * @param videoEl - The video element to check.
 * @returns The current playback time in seconds.
 */
export const getCurrentPlaybackTime = (videoEl: HTMLVideoElement): number => {
  return videoEl.currentTime;
};

/**
 * Sets the volume of the video.
 * @param videoEl - The video element to adjust.
 * @param volume - The volume level (0.0 to 1.0).
 */
export const setVideoVolume = (videoEl: HTMLVideoElement, volume: number): void => {
  videoEl.volume = clamp01(volume); // Ensure volume is between 0 and 1
};

/**
 * Mutes or unmutes the video.
 * @param videoEl - The video element to adjust.
 * @param mute - True to mute, false to unmute.
 */
export const setVideoMute = (videoEl: HTMLVideoElement, mute: boolean): void => {
  videoEl.muted = mute;
};
