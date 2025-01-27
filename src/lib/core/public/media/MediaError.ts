/**
 * Enum for media error codes.
 * Maps the HTMLMediaElement error codes to human-readable constants.
 *
 * @enum {number}
 */
export enum EMediaErrorCode {
  /** The media playback was aborted by the user. */
  MEDIA_ERR_ABORTED = 1,

  /** A network error occurred causing the media download to fail. */
  MEDIA_ERR_NETWORK = 2,

  /** An error occurred while decoding the media. */
  MEDIA_ERR_DECODE = 3,

  /** The media source format is not supported. */
  MEDIA_ERR_SRC_NOT_SUPPORTED = 4,
}

/**
 * Returns a user-friendly message based on the provided media error code.
 *
 * @param {number} errorCode - The error code from the HTMLMediaElement.
 * @returns {string} - A human-readable message describing the error.
 *
 * @example
 * const message = getMediaErrorMessage(1);
 * console.log(message); // "The media playback was aborted by the user."
 */
export const getMediaErrorMessage = (errorCode: number): string => {
  switch (errorCode) {
    case EMediaErrorCode.MEDIA_ERR_ABORTED:
      return "The media playback was aborted by the user.";
    case EMediaErrorCode.MEDIA_ERR_NETWORK:
      return "A network error caused the media download to fail.";
    case EMediaErrorCode.MEDIA_ERR_DECODE:
      return "An error occurred while decoding the media.";
    case EMediaErrorCode.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "The media source format is not supported.";
    default:
      return "An unknown media error occurred.";
  }
};

/**
 * Checks for media errors on the provided HTML media element and logs an error message.
 *
 * @param {HTMLMediaElement} mediaEl - The HTML media element to check for errors.
 *
 * @example
 * const videoEl = document.querySelector("video");
 * checkMediaError(videoEl);
 */
export const checkMediaError = (mediaEl: HTMLMediaElement): void => {
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
