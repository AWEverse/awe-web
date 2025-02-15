/**
 * Utility module for cross-platform detection with backward compatibility.
 * Uses feature detection wherever possible and falls back to userAgent parsing
 * for legacy devices.
 */

/** Flag indicating if running in a browser environment */
export const IS_BROWSER =
  typeof window !== "undefined" && typeof navigator !== "undefined";

/**
 * Detect basic device types based on screen and feature detection.
 * Returns "mobile", "tablet", or "desktop".
 */
export function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (!IS_BROWSER) {
    return "desktop";
  }

  // Prefer feature detection: Touch support, screen width, etc.
  const hasTouch =
    "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
  const width = window.innerWidth || document.documentElement.clientWidth;

  // Use media queries if supported for further refinement.
  const mq =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(pointer:coarse)")
      : null;
  const isCoarse = mq ? mq.matches : false;

  // Define thresholds that work reasonably well across devices.
  if (hasTouch && (width <= 768 || isCoarse)) {
    // A small screen with touch: likely a mobile.
    return "mobile";
  }
  if (hasTouch && width <= 1024) {
    // Touch devices with moderate screen size: tablet.
    return "tablet";
  }
  return "desktop";
}

/**
 * Browser detection using feature checks and fallback on userAgent parsing.
 * Returns an object containing flags for common browsers.
 */
export const BrowserInfo = (() => {
  if (!IS_BROWSER) {
    return {
      isChrome: false,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isIE: false,
      isOpera: false,
      ua: "",
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const isChrome = /chrome/.test(ua) && !/edge|opr/.test(ua);
  const isFirefox = /firefox/.test(ua);
  // Safari: Exclude Chrome and Android (and newer Edge)
  const isSafari =
    /safari/.test(ua) && !/chrome|android|crios|opr|edge/.test(ua);
  const isEdge = /edg/.test(ua);
  const isIE = /msie|trident/.test(ua);
  const isOpera = /opr/.test(ua);

  return {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isIE,
    isOpera,
  };
})();

/**
 * Retrieve the Chromium version if available.
 * Returns the version as a number or undefined.
 */
export const CHROMIUM_VERSION = (() => {
  if (!IS_BROWSER) return undefined;
  const match = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9.]+)/);
  return match ? parseFloat(match[1]) : undefined;
})();

/**
 * Normalizes the platform name detected via feature detection and userAgent parsing.
 * For instance, "macOS" becomes "macos".
 */
export const PLATFORM_ENV_NORMALIZED = (() => {
  if (!IS_BROWSER) return undefined;
  const ua = navigator.userAgent.toLowerCase();
  let platform: string | undefined;
  if (/iphone|ipad|ipod/.test(ua)) {
    platform = "iOS";
  } else if (/(macintosh|macintel|macppc|mac68k)/.test(ua)) {
    platform = "macOS";
  } else if (/win32|win64|windows|wince/.test(ua)) {
    platform = "Windows";
  } else if (/android/.test(ua)) {
    platform = "Android";
  } else if (/linux/.test(ua)) {
    platform = "Linux";
  }
  return platform ? platform.toLowerCase().replace(/\s+/g, "-") : undefined;
})();

/**
 * Combined export of detected environment flags.
 */
export const ENV = {
  IS_BROWSER,
  deviceType: detectDeviceType(),
  BrowserInfo,
  CHROMIUM_VERSION,
  PLATFORM_ENV_NORMALIZED,
  // Additional flags for specific conditions
  IS_MOBILE: detectDeviceType() === "mobile",
  IS_TABLET: detectDeviceType() === "tablet",
  IS_DESKTOP: detectDeviceType() === "desktop",
};
