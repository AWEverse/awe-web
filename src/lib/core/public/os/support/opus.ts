const audio = document.createElement("audio");

/**
 * Checks if the browser supports the OPUS codec in Ogg format.
 * This is determined by checking if the `canPlayType` method exists on the `audio` element
 * and whether it returns a non-"no" result for the `audio/ogg` MIME type.
 *
 * @returns {boolean} `true` if OPUS codec in Ogg format is supported, `false` otherwise.
 */
const IS_OPUS_SUPPORTED = !!(
  audio.canPlayType && audio.canPlayType("audio/ogg;").replace(/no/, "")
);

export default IS_OPUS_SUPPORTED;
