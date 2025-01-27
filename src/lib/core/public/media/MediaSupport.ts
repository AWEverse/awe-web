import { getMediaErrorMessage } from "./MediaError";

/**
 * Checks if the given media element supports the specified MIME type.
 *
 * @param {HTMLMediaElement} mediaEl - The HTML media element (audio or video) to check.
 * @param {string} mimeType - The MIME type of the media format to check (e.g., 'video/mp4', 'audio/ogg').
 * @returns {boolean} - Returns `true` if the media format is supported, otherwise `false`.
 *
 * @example
 * const videoEl = document.querySelector("video");
 * const isSupported = isMediaFormatSupported(videoEl, 'video/mp4');
 * console.log(isSupported); // true or false based on support
 */
export const isMediaFormatSupported = (
  mediaEl: HTMLMediaElement,
  mimeType: string,
): boolean => {
  if (!mediaEl || !mediaEl.canPlayType) {
    console.warn(
      "Media element or format support is not available in this browser.",
    );
    return false;
  }

  const canPlay = mediaEl.canPlayType(mimeType);
  return canPlay === "probably" || canPlay === "maybe";
};

/**
 * Checks if the browser supports HTML5 media elements (audio and video).
 *
 * @returns {boolean} - Returns `true` if HTML5 media elements are supported, otherwise `false`.
 *
 * @example
 * const isSupported = isMediaElementSupported();
 * console.log(isSupported); // true or false based on support
 */
export const isMediaElementSupported = (): boolean => {
  const isSupported =
    !!document.createElement("video").canPlayType ||
    !!document.createElement("audio").canPlayType;
  if (!isSupported) {
    console.warn(
      "HTML5 media elements (audio/video) are not supported in this browser.",
    );
  }
  return isSupported;
};

/**
 * Checks for media errors on the provided HTML media element and logs the error message if an error is found.
 *
 * @param {HTMLMediaElement} mediaEl - The HTML media element to check for errors.
 *
 * @example
 * const videoEl = document.querySelector("video");
 * checkMediaError(videoEl);
 */
export const checkMediaError = (mediaEl: HTMLMediaElement): void => {
  if (!mediaEl) {
    console.warn("No media element provided for error checking.");
    return;
  }

  const { error } = mediaEl;
  if (error) {
    const message = getMediaErrorMessage(error.code);
    console.error(`Media Error (${error.code}): ${message}`);
  }
};

/**
 * Tracks media errors by attaching an error event listener to the provided HTML media element.
 * When an error occurs, the error message is logged, and the provided callback is invoked with the error details.
 *
 * @param {HTMLMediaElement} mediaEl - The HTML media element to track errors for.
 * @param {(error: { code: number; message: string }) => void} trackCallback - The callback function to handle the error details.
 *
 * @example
 * const videoEl = document.querySelector("video");
 * trackMediaError(videoEl, (error) => {
 *   console.log("Tracked media error:", error);
 * });
 */
export const trackMediaError = (
  mediaEl: HTMLMediaElement,
  trackCallback: (error: { code: number; message: string }) => void,
): void => {
  mediaEl.onerror = () => {
    const { error } = mediaEl;
    if (error) {
      const message = getMediaErrorMessage(error.code);
      console.error(`Tracking Media Error (${error.code}): ${message}`);
      trackCallback({ code: error.code, message });
    }
  };
};
