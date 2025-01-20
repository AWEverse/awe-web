/**
 * Flag indicating if the environment is a browser.
 * Detects whether `window` is defined, which is typically the case in a browser environment.
 */
export const IS_BROWSER = typeof window !== "undefined";

/**
 * Detects the platform based on the user agent string.
 * It returns a string representing the platform or `undefined` if it cannot be detected.
 *
 * @returns {string | undefined} The platform name, e.g., "iOS", "macOS", "Windows", etc.
 */
export function getPlatform(): string | undefined {
  const userAgent = window.navigator.userAgent.toLowerCase();

  // Platform-specific checks
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "iOS";
  }

  if (/(macintosh|macintel|macppc|mac68k)/.test(userAgent)) {
    return "macOS";
  }

  if (/win32|win64|windows|wince/.test(userAgent)) {
    return "Windows";
  }

  if (/android/.test(userAgent)) {
    return "Android";
  }

  if (/linux/.test(userAgent)) {
    return "Linux";
  }

  return undefined;
}

/**
 * The current platform environment detected based on the user agent.
 * This will be updated automatically when the platform is detected.
 */
export const PLATFORM_ENV = getPlatform();

/** Extracted and normalized userAgent string for further browser-specific checks */
const userAgent = navigator.userAgent.toLowerCase();

export const IS_MAC_OS = PLATFORM_ENV === "macOS";
export const IS_WINDOWS = PLATFORM_ENV === "Windows";
export const IS_LINUX = PLATFORM_ENV === "Linux";
export const IS_IOS = PLATFORM_ENV === "iOS";
export const IS_ANDROID = PLATFORM_ENV === "Android";

/**
 * Flag indicating if the device is mobile (either iOS or Android).
 */
export const IS_MOBILE = IS_IOS || IS_ANDROID;

/**
 * Chromium version detected from the user agent.
 * If the user agent matches a Chromium browser, returns the version number.
 */
export const CHROMIUM_VERSION = (() => {
  try {
    const match = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9.]+)/);
    return match ? +match[1] : undefined;
  } catch (err) {
    return undefined;
  }
})();

/**
 * Flag indicating if the browser is Safari.
 * Specifically excludes browsers that identify as Chrome or Android.
 */
export const IS_SAFARI =
  /safari/i.test(userAgent) && !/chrome|android/i.test(userAgent);

/**
 * Flag indicating if the browser is Yandex Browser.
 * Looks for "yabrowser" in the user agent string.
 */
export const IS_YA_BROWSER = userAgent.includes("yabrowser");

/**
 * Flag indicating if the browser is Firefox.
 * Detects several possible identifiers for Firefox-based browsers.
 */
export const IS_FIREFOX =
  userAgent.includes("firefox") ||
  userAgent.includes("iceweasel") ||
  userAgent.includes("icecat");

/**
 * Normalized version of the platform environment in lowercase, with spaces replaced by dashes.
 * For example, "macOS" will become "macos".
 */
export const PLATFORM_ENV_NORMALIZED = PLATFORM_ENV?.toLowerCase().replace(
  " ",
  "-",
);
