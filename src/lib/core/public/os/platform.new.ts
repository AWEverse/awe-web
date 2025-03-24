/**
 * Low-level platform utilities module for cross-platform detection with backward compatibility.
 * Uses feature detection whenever possible and falls back to userAgent parsing for legacy devices.
 */

import {
  getIsDesktop,
  getIsMobile,
  getIsTablet,
} from "@/lib/hooks/ui/useAppLayout";

/** Flag indicating if running in a browser environment */
export const IS_BROWSER =
  typeof window !== "undefined" && typeof navigator !== "undefined";

/** Cached user agent string to avoid repeated calls to navigator.userAgent */
const cachedUserAgent = IS_BROWSER ? navigator.userAgent.toLowerCase() : "";

/** Low-level function to detect if a device supports touch inputs */
const hasTouchSupport = (): boolean =>
  IS_BROWSER && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

/** Low-level function to retrieve screen width */
const getScreenWidth = (): number =>
  IS_BROWSER ? window.innerWidth || document.documentElement.clientWidth : 0;

/** Low-level function to detect coarse pointer capability using media queries */
const supportsCoarsePointer = (): boolean =>
  IS_BROWSER && typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer:coarse)").matches
    : false;

/**
 * Detect basic device types based on touch support, screen width, and media queries.
 * Returns "mobile", "tablet", or "desktop".
 */
export function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (!IS_BROWSER) return "desktop";

  const width = getScreenWidth();
  const hasTouch = hasTouchSupport();
  const isCoarse = supportsCoarsePointer();

  if (hasTouch && (width <= 768 || isCoarse)) return "mobile";
  if (hasTouch && width <= 1024) return "tablet";
  return "desktop";
}

/** Detect specific browser environments via userAgent parsing */
export const BrowserInfo = (() => {
  const ua = cachedUserAgent;
  const isChrome = /chrome/.test(ua) && !/edge|opr/.test(ua);
  const isFirefox = /firefox/.test(ua);
  const isSafari =
    /safari/.test(ua) && !/chrome|android|crios|opr|edge/.test(ua);
  const isEdge = /edg/.test(ua);
  const isIE = /msie|trident/.test(ua);
  const isOpera = /opr/.test(ua);

  return { isChrome, isFirefox, isSafari, isEdge, isIE, isOpera };
})();

/**
 * Retrieve the Chromium version if available.
 * Returns the version as a number or undefined.
 */
export const getChromiumVersion = (): number | undefined => {
  const match = cachedUserAgent.match(/Chrom(?:e|ium)\/([0-9.]+)/);
  return match ? parseFloat(match[1]) : undefined;
};

/**
 * Normalize platform names detected via feature detection and userAgent parsing.
 */
export const getNormalizedPlatform = (): string | undefined => {
  const ua = cachedUserAgent;
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/macintosh|macintel|macppc|mac68k/.test(ua)) return "macos";
  if (/win32|win64|windows|wince/.test(ua)) return "windows";
  if (/android/.test(ua)) return "android";
  if (/linux/.test(ua)) return "linux";
  return undefined;
};

/**
 * Detects the operating system version from the user agent string.
 * This is a basic implementation and may require refinement for accuracy.
 */
export const getOSVersion = (): string | undefined => {
  const ua = cachedUserAgent;
  const osVersionMatch = ua.match(/(?:windows nt|mac os x|android) ([0-9.]+)/);
  return osVersionMatch ? osVersionMatch[1] : undefined;
};

/** Combined export of detected environment flags with lazy evaluation */
export const ENV = {
  IS_BROWSER,
  get deviceType() {
    return detectDeviceType();
  },
  BrowserInfo,
  get CHROMIUM_VERSION() {
    return getChromiumVersion();
  },
  get PLATFORM_ENV_NORMALIZED() {
    return getNormalizedPlatform();
  },
  get OS_VERSION() {
    return getOSVersion();
  },
  get IS_MOBILE() {
    return getIsMobile();
  },
  get IS_TABLET() {
    return getIsTablet();
  },
  get IS_DESKTOP() {
    return getIsDesktop();
  },
};
