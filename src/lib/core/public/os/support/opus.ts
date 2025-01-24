/**
 * Checks if the browser supports the OPUS codec in Ogg format.
 * This is determined by verifying if the `canPlayType` method exists on the `audio` element
 * and checking if it returns a positive result for the `audio/ogg; codecs="opus"` MIME type.
 *
 * @returns {boolean} `true` if OPUS codec in Ogg format is supported, `false` otherwise.
 */
export const IS_OPUS_SUPPORTED =
  new Audio().canPlayType?.("audio/ogg; codecs=opus") === "probably" ||
  new Audio().canPlayType?.("audio/ogg; codecs=opus") === "maybe";

/**
 * Checks if voice recording is supported in the current browser environment.
 *
 * This check verifies the following:
 * - `navigator.mediaDevices` exists and has the `getUserMedia` method for accessing microphone input.
 * - The browser supports `AudioContext` or `webkitAudioContext` (for older browsers like Safari).
 *
 * @returns {boolean} - `true` if voice recording is supported, otherwise `false`.
 */
export const IS_VOICE_RECORDING_SUPPORTED = Boolean(
  window.navigator.mediaDevices &&
    "getUserMedia" in window.navigator.mediaDevices &&
    (window.AudioContext ||
      (window as { webkitAudioContext?: unknown }).webkitAudioContext),
);
