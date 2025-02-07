import { IS_TEST } from "@/lib/config/dev";
import { IS_FIREFOX, IS_MOBILE } from "../platform";

/**
 * Check if the current environment is a Progressive Web App (PWA).
 */
export const IS_PWA =
  window.matchMedia?.("(display-mode: standalone)").matches ||
  !!(navigator as any).standalone ||
  document.referrer.startsWith("android-app://");

/**
 * Alias for `IS_PWA`, used to check if the current environment is an app.
 */
export const IS_APP = IS_PWA; // || IS_ELECTRON;

/**
 * Check if the current environment supports touch input.
 */
export const IS_TOUCH_ENV =
  "ontouchstart" in window && window.matchMedia("(pointer: coarse)").matches;

/**
 * Check if Service Workers are supported in the current environment.
 */
export const IS_SERVICE_WORKER_SUPPORTED = "serviceWorker" in navigator;

/**
 * Alias for `IS_SERVICE_WORKER_SUPPORTED`, used to check if Progressive Web App features are supported.
 */
export const IS_PROGRESSIVE_SUPPORTED = IS_SERVICE_WORKER_SUPPORTED;

/**
 * Check if the `filter` property is supported on canvas elements.
 * This is not available in test environments.
 */
// export const IS_CANVAS_FILTER_SUPPORTED =
//   !IS_TEST &&
//   "filter" in (document.createElement("canvas")!.getContext("2d") || {});

/**
 * Check if the browser supports `requestFullscreen` for elements.
 */
export const IS_REQUEST_FULLSCREEN_SUPPORTED = (() => {
  try {
    const element = document.createElement("div");

    return (
      "requestFullscreen" in element ||
      "mozRequestFullScreen" in element ||
      "webkitRequestFullscreen" in element ||
      "msRequestFullscreen" in element
    );
  } catch {
    return false;
  }
})();

export const IS_REQUEST_PICTURE_IN_PICTURE_SUPPORTED = (() => {
  try {
    return "pictureInPictureEnabled" in document;
  } catch {
    return false;
  }
})();

/**
 * Check if phone calls are supported (not on Firefox).
 */
export const ARE_CALLS_SUPPORTED = !IS_FIREFOX;

/**
 * Check if the browser supports the Origin Private File System (OPFS).
 */
export const IS_OPFS_SUPPORTED = Boolean(navigator.storage?.getDirectory);

/**
 * Check if the `offset-rotate` property is supported in CSS.
 */
export const IS_OFFSET_PATH_SUPPORTED =
  typeof CSS !== "undefined" ? CSS.supports("offset-rotate: 0deg") : false;
/**
 * Check if backdrop blur effect is supported in CSS.
 */
export const IS_BACKDROP_BLUR_SUPPORTED =
  typeof CSS !== "undefined"
    ? CSS.supports("backdrop-filter: blur(0px)") ||
      CSS.supports("-webkit-backdrop-filter: blur(0px)")
    : false;

/**
 * Check if the install prompt is supported (usually for PWAs).
 */
export const IS_INSTALL_PROMPT_SUPPORTED = "onbeforeinstallprompt" in window;

/**
 * Check if multi-tab communication is supported via `BroadcastChannel`.
 */
export const IS_MULTITAB_SUPPORTED = "BroadcastChannel" in window;

/**
 * Check if opening a new tab is supported (not in PWA on mobile).
 */
export const IS_OPEN_IN_NEW_TAB_SUPPORTED =
  IS_MULTITAB_SUPPORTED && !(IS_PWA && IS_MOBILE);

/**
 * Check if translation via `Intl.DisplayNames` is supported (not in test environments).
 */
export const IS_TRANSLATION_SUPPORTED = !IS_TEST && Boolean(Intl.DisplayNames);
