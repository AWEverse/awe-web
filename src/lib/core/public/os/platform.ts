export const IS_BROWSER = typeof window !== 'undefined';

export function getPlatform(): string | undefined {
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'iOS';
  }

  if (/(macintosh|macintel|macppc|mac68k)/.test(userAgent)) {
    return 'macOS';
  }

  if (/win32|win64|windows|wince/.test(userAgent)) {
    return 'Windows';
  }

  if (/android/.test(userAgent)) {
    return 'Android';
  }

  if (/linux/.test(userAgent)) {
    return 'Linux';
  }

  return undefined;
}

export const PLATFORM_ENV = getPlatform();
const userAgent = navigator.userAgent.toLowerCase();

export const IS_MAC_OS = PLATFORM_ENV === 'macOS';
export const IS_WINDOWS = PLATFORM_ENV === 'Windows';
export const IS_LINUX = PLATFORM_ENV === 'Linux';
export const IS_IOS = PLATFORM_ENV === 'iOS';
export const IS_ANDROID = PLATFORM_ENV === 'Android';
export const IS_MOBILE = IS_IOS || IS_ANDROID;

export const IS_SAFARI = /safari/i.test(userAgent) && !/chrome|android/i.test(userAgent);
// Specifically to exclude support
export const IS_YA_BROWSER = userAgent.includes('yabrowser');
export const IS_FIREFOX =
  userAgent.includes('firefox') || userAgent.includes('iceweasel') || userAgent.includes('icecat');

export const PLATFORM_ENV_NORMALIZED = PLATFORM_ENV?.toLowerCase().replace(' ', '-');
