import { IS_TEST } from "@/lib/config/dev";
import { IS_FIREFOX, IS_MOBILE } from "../platform";

export const IS_PWA =
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as { standalone?: boolean }).standalone ||
  document.referrer.includes("android-app://");

export const IS_APP = IS_PWA; // || IS_ELECTRON;

export const IS_TOUCH_ENV = window.matchMedia("(pointer: coarse)").matches;
export const IS_VOICE_RECORDING_SUPPORTED = Boolean(
  window.navigator.mediaDevices &&
    "getUserMedia" in window.navigator.mediaDevices &&
    (window.AudioContext ||
      (window as { webkitAudioContext?: unknown }).webkitAudioContext),
);
export const IS_SERVICE_WORKER_SUPPORTED = "serviceWorker" in navigator;
export const IS_PROGRESSIVE_SUPPORTED = IS_SERVICE_WORKER_SUPPORTED;
export const IS_OPUS_SUPPORTED = Boolean(
  new Audio().canPlayType("audio/ogg; codecs=opus"),
);
export const IS_CANVAS_FILTER_SUPPORTED =
  !IS_TEST &&
  "filter" in (document.createElement("canvas").getContext("2d") || {});
export const IS_REQUEST_FULLSCREEN_SUPPORTED =
  "requestFullscreen" in document.createElement("div");
export const ARE_CALLS_SUPPORTED = !IS_FIREFOX;
export const IS_OPFS_SUPPORTED = Boolean(navigator.storage?.getDirectory);

export const IS_OFFSET_PATH_SUPPORTED = CSS.supports("offset-rotate: 0deg");
export const IS_BACKDROP_BLUR_SUPPORTED =
  CSS.supports("backdrop-filter: blur()") ||
  CSS.supports("-webkit-backdrop-filter: blur()");
export const IS_INSTALL_PROMPT_SUPPORTED = "onbeforeinstallprompt" in window;
export const IS_MULTITAB_SUPPORTED = "BroadcastChannel" in window;
export const IS_OPEN_IN_NEW_TAB_SUPPORTED =
  IS_MULTITAB_SUPPORTED && !(IS_PWA && IS_MOBILE);
export const IS_TRANSLATION_SUPPORTED = !IS_TEST && Boolean(Intl.DisplayNames);

export const SCROLLBAR_WIDTH = (() => {
  const el = document.createElement("div");
  el.style.cssText =
    "overflow:scroll; visibility:hidden; position:absolute; width:50px; height:50px;";
  document.body.appendChild(el);

  const width = el.offsetWidth - el.clientWidth;
  document.body.removeChild(el);

  // Set the scrollbar width as a CSS custom property
  document.documentElement.style.setProperty("--scrollbar-width", `${width}px`);

  return width;
})();
