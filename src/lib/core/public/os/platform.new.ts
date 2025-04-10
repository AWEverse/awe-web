import {
  getIsDesktop,
  getIsMobile,
  getIsTablet,
} from "@/lib/hooks/ui/useAppLayout";

export const IS_BROWSER =
  typeof window !== "undefined" && typeof navigator !== "undefined";

let _userAgent: string | null = null;
const getUA = (): string => {
  if (_userAgent === null && IS_BROWSER) {
    _userAgent = navigator.userAgent.toLowerCase();
  }
  return _userAgent ?? "";
};

const getScreenWidth = (): number =>
  IS_BROWSER ? window.innerWidth || document.documentElement.clientWidth : 0;

const hasTouchSupport = (): boolean =>
  IS_BROWSER &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const supportsCoarsePointer = (): boolean =>
  IS_BROWSER &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer:coarse)").matches;

type DeviceType = "mobile" | "tablet" | "desktop";

let _deviceType: DeviceType = "desktop";
let initialized = false;
let updateTimeout: number | null = null;

function evaluateDeviceType(): DeviceType {
  const width = getScreenWidth();
  if (hasTouchSupport()) {
    if (width <= 768 || supportsCoarsePointer()) return "mobile";
    if (width <= 1024) return "tablet";
  }
  return "desktop";
}

function setupDeviceTypeWatcher() {
  if (!IS_BROWSER || initialized) return;
  initialized = true;

  const update = () => {
    const newType = evaluateDeviceType();
    if (_deviceType !== newType) {
      _deviceType = newType;
    }
  };

  const debouncedUpdate = () => {
    if (updateTimeout !== null) clearTimeout(updateTimeout);
    updateTimeout = window.setTimeout(update, 200);
  };

  window.addEventListener("resize", debouncedUpdate, { passive: true });
  _deviceType = evaluateDeviceType();
}

/**
 * Safe, cached, lazy-evaluated device type.
 */
const getDeviceType = (): DeviceType => {
  setupDeviceTypeWatcher();
  return _deviceType;
};

const getBrowserInfo = () => {
  const ua = getUA();
  return {
    isChrome: /chrome/.test(ua) && !/edg|opr/.test(ua),
    isFirefox: /firefox/.test(ua),
    isSafari: /safari/.test(ua) && !/chrome|android|crios|opr|edg/.test(ua),
    isEdge: /edg/.test(ua),
    isIE: /msie|trident/.test(ua),
    isOpera: /opr/.test(ua),
  };
};

const getChromiumVersion = (): number | undefined => {
  const match = getUA().match(/chrom(?:e|ium)\/([0-9.]+)/);
  return match ? parseFloat(match[1]) : undefined;
};

const getNormalizedPlatform = (): string | undefined => {
  const ua = getUA();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/mac/.test(ua)) return "macos";
  if (/win/.test(ua)) return "windows";
  if (/android/.test(ua)) return "android";
  if (/linux/.test(ua)) return "linux";
  return undefined;
};

const getOSVersion = (): string | undefined => {
  const match = getUA().match(/(?:windows nt|mac os x|android) ([0-9._]+)/);
  return match ? match[1].replace(/_/g, ".") : undefined;
};


export default {
  IS_BROWSER,
  get deviceType() {
    return getDeviceType();
  },
  get BrowserInfo() {
    return getBrowserInfo();
  },
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
} as const;
