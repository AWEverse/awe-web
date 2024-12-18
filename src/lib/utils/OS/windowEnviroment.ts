export const IS_TEST = false;
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

export const SUPPORT_BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Microsoft Edge', 'Opera'];
export const SUPPORT_PLATFORMS = ['macOS', 'Windows', 'iOS', 'Android', 'Linux'];

export function getBrowser(): string | undefined {
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.includes('edg/')) {
    return 'Microsoft Edge';
  } else if (userAgent.includes('opr/') || userAgent.includes('opera')) {
    return 'Opera';
  } else if (userAgent.includes('chrome')) {
    return 'Google Chrome';
  } else if (userAgent.includes('safari')) {
    return 'Safari';
  } else if (userAgent.includes('firefox')) {
    return 'Mozilla Firefox';
  } else if (userAgent.includes('msie') || userAgent.includes('trident')) {
    return 'Internet Explorer';
  } else {
    return undefined;
  }
}

//export const IS_PRODUCTION_HOST = window.location.host === PRODUCTION_HOSTNAME;
export const PLATFORM_ENV = getPlatform();
export const IS_MAC_OS = PLATFORM_ENV === 'macOS';
export const IS_WINDOWS = PLATFORM_ENV === 'Windows';
export const IS_LINUX = PLATFORM_ENV === 'Linux';
export const IS_IOS = PLATFORM_ENV === 'iOS';
export const IS_ANDROID = PLATFORM_ENV === 'Android';
export const IS_MOBILE = IS_IOS || IS_ANDROID;
export const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
export const IS_YA_BROWSER = navigator.userAgent.includes('YaBrowser');
export const IS_FIREFOX =
  navigator.userAgent.toLowerCase().includes('firefox') ||
  navigator.userAgent.toLowerCase().includes('iceweasel') ||
  navigator.userAgent.toLowerCase().includes('icecat');

// export const IS_ELECTRON = Boolean(window.electron && !IS_SAFARI);

const normalizedPlatform = PLATFORM_ENV?.toLowerCase().replace(' ', '-');
const normalizedBrowser = getBrowser()?.toLowerCase().replace(' ', '-');

document.body.classList.remove(normalizedPlatform || '', normalizedBrowser || '');
document.body.classList.add(normalizedPlatform || '', normalizedBrowser || '');

export enum MouseButton {
  Main = 0,
  Auxiliary = 1,
  Secondary = 2,
  Fourth = 3,
  Fifth = 4,
}

export const IS_PWA =
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as { standalone?: boolean }).standalone ||
  document.referrer.includes('android-app://');

export const IS_APP = IS_PWA; //|| IS_ELECTRON;

export const IS_TOUCH_ENV = window.matchMedia('(pointer: coarse)').matches;
export const IS_VOICE_RECORDING_SUPPORTED = Boolean(
  window.navigator.mediaDevices &&
    'getUserMedia' in window.navigator.mediaDevices &&
    (window.AudioContext || (window as { webkitAudioContext?: unknown }).webkitAudioContext),
);
export const IS_EMOJI_SUPPORTED =
  PLATFORM_ENV && (IS_MAC_OS || IS_IOS) && isLastEmojiVersionSupported();
export const IS_SERVICE_WORKER_SUPPORTED = 'serviceWorker' in navigator;
// TODO Consider failed service worker
export const IS_PROGRESSIVE_SUPPORTED = IS_SERVICE_WORKER_SUPPORTED;
export const IS_OPUS_SUPPORTED = Boolean(new Audio().canPlayType('audio/ogg; codecs=opus'));
export const IS_CANVAS_FILTER_SUPPORTED =
  !IS_TEST && 'filter' in (document.createElement('canvas').getContext('2d') || {});
export const IS_REQUEST_FULLSCREEN_SUPPORTED = 'requestFullscreen' in document.createElement('div');
export const ARE_CALLS_SUPPORTED = !IS_FIREFOX;
export const LAYERS_ANIMATION_NAME = IS_ANDROID
  ? 'slideFade'
  : IS_IOS
    ? 'slideLayers'
    : 'pushSlide';

const TEST_VIDEO = document.createElement('video');

export const IS_WEBM_SUPPORTED = Boolean(
  TEST_VIDEO.canPlayType('video/webm; codecs="vp9"').replace('no', ''),
);

export const ARE_WEBCODECS_SUPPORTED = 'VideoDecoder' in window;

export const MASK_IMAGE_DISABLED = true;
export const IS_OPFS_SUPPORTED = Boolean(navigator.storage?.getDirectory);

if (IS_OPFS_SUPPORTED) {
  // Clear old contents
  (async () => {
    try {
      const directory = await navigator.storage.getDirectory();
      await directory.removeEntry('downloads', { recursive: true });
    } catch {
      // Ignore
    }
  })();
}

export const IS_OFFSET_PATH_SUPPORTED = CSS.supports('offset-rotate: 0deg');
export const IS_BACKDROP_BLUR_SUPPORTED =
  CSS.supports('backdrop-filter: blur()') || CSS.supports('-webkit-backdrop-filter: blur()');
export const IS_INSTALL_PROMPT_SUPPORTED = 'onbeforeinstallprompt' in window;
export const IS_MULTITAB_SUPPORTED = 'BroadcastChannel' in window;
export const IS_OPEN_IN_NEW_TAB_SUPPORTED = IS_MULTITAB_SUPPORTED && !(IS_PWA && IS_MOBILE);
export const IS_TRANSLATION_SUPPORTED = !IS_TEST && Boolean(Intl.DisplayNames);

export const MESSAGE_LIST_SENSITIVE_AREA = 750;

export const SCROLLBAR_WIDTH = (() => {
  const el = document.createElement('div');
  el.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;';
  el.classList.add('custom-scroll');
  document.body.appendChild(el);
  const width = el.offsetWidth - el.clientWidth;
  el.remove();

  document.documentElement.style.setProperty('--scrollbar-width', `${width}px`);

  return width;
})();

export const MAX_BUFFER_SIZE = (IS_MOBILE ? 512 : 2000) * 1024 ** 2; // 512 OR 2000 MB

function isLastEmojiVersionSupported() {
  const ALLOWABLE_CALCULATION_ERROR_SIZE = 5;
  const inlineEl = document.createElement('span');
  inlineEl.classList.add('emoji-test-element');
  document.body.appendChild(inlineEl);

  inlineEl.innerText = '🐦‍🔥'; // Emoji from 15.1 version
  const newEmojiWidth = inlineEl.offsetWidth;
  inlineEl.innerText = '❤️'; // Emoji from 1.0 version
  const legacyEmojiWidth = inlineEl.offsetWidth;

  document.body.removeChild(inlineEl);

  return Math.abs(newEmojiWidth - legacyEmojiWidth) < ALLOWABLE_CALCULATION_ERROR_SIZE;
}

export function createFPSCounter() {
  const fpsElement = document.createElement('div');

  fpsElement.classList.add('__fps');
  document.body.appendChild(fpsElement);

  let lastTime = performance.now();
  let frameCount = 0;
  let fps = 0;
  let animationId: number;

  function calculateFPS(timestamp: number) {
    frameCount++;
    let delta = timestamp - lastTime;

    if (delta >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = timestamp;
      fpsElement.textContent = `FPS: ${fps}`;
    }

    animationId = requestAnimationFrame(calculateFPS);
  }

  function start() {
    animationId = requestAnimationFrame(calculateFPS);
  }

  function stop() {
    cancelAnimationFrame(animationId);
    fpsElement.remove();
  }

  return { start, stop };
}
