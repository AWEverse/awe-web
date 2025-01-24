import {
  IS_MAC_OS,
  IS_LINUX,
  IS_WINDOWS,
  IS_IOS,
  IS_ANDROID,
} from "../platform";

export const IS_WEBM_SUPPORTED = (() => {
  const TEST_VIDEO = document.createElement("video");

  return Boolean(
    TEST_VIDEO.canPlayType('video/webm; codecs="vp9"').replace("no", ""),
  );
})();

export const ARE_WEBCODECS_SUPPORTED = "VideoDecoder" in window;

export const IS_WEBM_SUPPORTED_ON_MAC =
  IS_WEBM_SUPPORTED && (IS_MAC_OS || IS_LINUX);
export const IS_WEBM_SUPPORTED_ON_WINDOWS = IS_WEBM_SUPPORTED && IS_WINDOWS;
export const IS_WEBM_SUPPORTED_ON_IOS = IS_WEBM_SUPPORTED && IS_IOS;
export const IS_WEBM_SUPPORTED_ON_ANDROID = IS_WEBM_SUPPORTED && IS_ANDROID;

export const IS_WEBCODECS_SUPPORTED_ON_MAC =
  ARE_WEBCODECS_SUPPORTED && IS_MAC_OS;
export const IS_WEBCODECS_SUPPORTED_ON_WINDOWS =
  ARE_WEBCODECS_SUPPORTED && IS_WINDOWS;
export const IS_WEBCODECS_SUPPORTED_ON_IOS = ARE_WEBCODECS_SUPPORTED && IS_IOS;
export const IS_WEBCODECS_SUPPORTED_ON_ANDROID =
  ARE_WEBCODECS_SUPPORTED && IS_ANDROID;
