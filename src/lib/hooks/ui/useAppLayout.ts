import { useEffect } from "react";
import {
  MOBILE_SCREEN_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT,
  MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN,
} from "../../config/app";
import { createCallbackManager } from "../../utils/callbacks";
import { IS_IOS } from "@/lib/core";
import { updateSizes } from "../../utils/windowSize";
import { useTriggerReRender } from "@/shared/hooks/state";

type MediaQueryCacheKey = "mobile" | "tablet" | "landscape" | "touch";

const mediaQueryCache = new Map<MediaQueryCacheKey, MediaQueryList>();
const callbacks = createCallbackManager();

let isMobile: boolean | undefined;
let isTablet: boolean | undefined;
let isLandscape: boolean | undefined;
let isTouchScreen: boolean | undefined;

export function getIsMobile() {
  return isMobile;
}

export function getIsTablet() {
  return isTablet;
}

const QUERIES = {
  mobile: `(max-width: ${MOBILE_SCREEN_MAX_WIDTH}px), \
  (max-width: ${MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH}px and max-height: ${MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT}px)`,
  tablet: `(max-width: ${MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN}px)`,
  landscape: IS_IOS
    ? "(orientation: landscape)"
    : // Source: https://web.archive.org/web/20160509220835/http://blog.abouthalf.com/development/orientation-media-query-challenges-in-android-browsers/
      // Feature is marked as deprecated now, but it is still supported
      // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/device-aspect-ratio#browser_compatibility
      "screen and (min-device-aspect-ratio: 1/1) and (orientation: landscape)",
  touch: "(pointer: coarse)",
};

(() => {
  for (const [key, query] of Object.entries(QUERIES)) {
    const mediaQuery = window.matchMedia(query);
    mediaQueryCache.set(key as MediaQueryCacheKey, mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
  }
})();

function handleMediaQueryChange() {
  const mobileQuery = mediaQueryCache.get("mobile");
  const tabletQuery = mediaQueryCache.get("tablet");
  const landscapeQuery = mediaQueryCache.get("landscape");
  const touchQuery = mediaQueryCache.get("touch");

  isMobile = mobileQuery?.matches || false;
  isTablet = (!isMobile && tabletQuery?.matches) || false;
  isLandscape = landscapeQuery?.matches || false;
  isTouchScreen = touchQuery?.matches || false;

  updateSizes();
  callbacks.runCallbacks();
}
handleMediaQueryChange();

export default function useAppLayout() {
  const forceUpdate = useTriggerReRender();

  useEffect(() => callbacks.addCallback(forceUpdate), [forceUpdate]);

  return {
    isMobile,
    isTablet,
    isLandscape,
    isDesktop: !isMobile && !isTablet,
    isTouchScreen,
  };
}
