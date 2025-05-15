/**
 * Flag indicating if the environment is a browser.
 * Detects whether `window` is defined, which is typically the case in a browser environment.
 */
export const IS_BROWSER = typeof window !== 'undefined';

const PLATFORM_PATTERNS = [
  { key: 'iphone', platform: 'iOS' },
  { key: 'ipad', platform: 'iOS' },
  { key: 'ipod', platform: 'iOS' },
  { key: 'macintosh', platform: 'macOS' },
  { key: 'macintel', platform: 'macOS' },
  { key: 'macppc', platform: 'macOS' },
  { key: 'mac68k', platform: 'macOS' },
  { key: 'win32', platform: 'Windows' },
  { key: 'win64', platform: 'Windows' },
  { key: 'windows', platform: 'Windows' },
  { key: 'wince', platform: 'Windows' },
  { key: 'android', platform: 'Android' },
  { key: 'linux', platform: 'Linux' },
];

/**
 * Detects the platform using a single-pass, C-like efficient parsing of userAgent.
 * @returns {string | undefined} The detected platform name or undefined if unrecognized.
 */
export function getPlatform(): string | undefined {
  if (!IS_BROWSER) return undefined;

  const ua = navigator.userAgent.toLowerCase();

  for (let i = 0; i < PLATFORM_PATTERNS.length; i++) {
    const { key, platform } = PLATFORM_PATTERNS[i];
    if (ua.includes(key)) {
      return platform;
    }
  }

  return undefined;
}

/**
 * The current platform environment detected based on the user agent.
 */
export const PLATFORM_ENV = getPlatform();

/** Extracted and normalized userAgent string for further checks */
const userAgent = IS_BROWSER ? navigator.userAgent.toLowerCase() : '';

/** Platform-specific flags */
export const IS_MAC_OS = PLATFORM_ENV === 'macOS';
export const IS_WINDOWS = PLATFORM_ENV === 'Windows';
export const IS_LINUX = PLATFORM_ENV === 'Linux';
export const IS_IOS = PLATFORM_ENV === 'iOS';
export const IS_ANDROID = PLATFORM_ENV === 'Android';

/**
 * Flag indicating if the device is mobile (either iOS or Android).
 */
export const IS_MOBILE = IS_IOS || IS_ANDROID;

/**
 * Chromium version detected from the user agent.
 * Returns the version number if a Chromium browser is detected, otherwise undefined.
 */
export const CHROMIUM_VERSION = IS_BROWSER
  ? (() => {
    const match = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9.]+)/);
    return match ? parseFloat(match[1]) : undefined;
  })()
  : undefined;

/**
 * Flag indicating if the browser is Safari.
 * Excludes browsers identifying as Chrome or Android.
 */
export const IS_SAFARI = userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('android');

/**
 * Flag indicating if the browser is Yandex Browser.
 */
export const IS_YA_BROWSER = userAgent.includes('yabrowser');

/**
 * Flag indicating if the browser is Firefox.
 * Detects several possible identifiers for Firefox-based browsers.
 */
export const IS_FIREFOX = userAgent.includes('firefox') || userAgent.includes('iceweasel') || userAgent.includes('icecat');

/**
 * Normalized version of the platform environment in lowercase, with spaces replaced by dashes.
 * For example, "macOS" becomes "macos".
 */
export const PLATFORM_ENV_NORMALIZED = PLATFORM_ENV?.toLowerCase().replace(' ', '-') || '';

/**
 * Returns true if the current environment is Electron.
 */
export function isElectron(): boolean {
  return IS_BROWSER && typeof window !== 'undefined' &&
    (window as any).process?.type === 'renderer';
}

export function isNode(): boolean {
  return typeof process !== 'undefined' && !!process.versions?.node && !isElectron();
}

/**
 * Returns true if the current environment is a Progressive Web App (PWA).
 */
export function isPWA(): boolean {
  return IS_BROWSER && (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true);
}

/**
 * Returns true if the device supports touch events.
 */
export function isTouchDevice(): boolean {
  return IS_BROWSER && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

/**
 * Returns true if the device supports pointer events and has a coarse pointer (touch).
 */
export function isCoarsePointer(): boolean {
  return IS_BROWSER && window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Returns a detailed platform info object.
 */
export function getPlatformInfo(key?: string | string[]): boolean | {
  platform: typeof PLATFORM_ENV,
  normalized: typeof PLATFORM_ENV_NORMALIZED,
  isMac: typeof IS_MAC_OS,
  isWindows: typeof IS_WINDOWS,
  isLinux: typeof IS_LINUX,
  isIOS: typeof IS_IOS,
  isAndroid: typeof IS_ANDROID,
  isMobile: typeof IS_MOBILE,
  isSafari: typeof IS_SAFARI,
  isFirefox: typeof IS_FIREFOX,
  isYandex: typeof IS_YA_BROWSER,
  chromiumVersion: typeof CHROMIUM_VERSION,
  isElectron: boolean,
  isNode: boolean,
  isPWA: boolean,
  isTouchDevice: boolean,
  isCoarsePointer: boolean,
  userAgent: string,
} {
  const info = {
    platform: PLATFORM_ENV,
    normalized: PLATFORM_ENV_NORMALIZED,
    isMac: IS_MAC_OS,
    isWindows: IS_WINDOWS,
    isLinux: IS_LINUX,
    isIOS: IS_IOS,
    isAndroid: IS_ANDROID,
    isMobile: IS_MOBILE,
    isSafari: IS_SAFARI,
    isFirefox: IS_FIREFOX,
    isYandex: IS_YA_BROWSER,
    chromiumVersion: CHROMIUM_VERSION,
    isElectron: isElectron(),
    isNode: isNode(),
    isPWA: isPWA(),
    isTouchDevice: isTouchDevice(),
    isCoarsePointer: isCoarsePointer(),
    userAgent: userAgent,
  };

  if (key) {
    return Boolean(info[key as keyof typeof info]);
  }

  return info;
}
