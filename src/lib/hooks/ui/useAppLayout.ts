import { useEffect, useMemo, useState } from "react";
import {
  MOBILE_SCREEN_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT,
  MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN,
} from "../../config/app";
import { debounce, IS_IOS } from "@/lib/core";
import { createCallbackManager } from "../../utils/callbacks";

enum EMediaQueryKey {
  Mobile = "mobile",
  Tablet = "tablet",
  Landscape = "landscape",
  Touch = "touch",
}

type LayoutState = {
  isMobile: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isDesktop: boolean;
  isTouchScreen: boolean;
};

const mediaQueryCache = new Map<EMediaQueryKey, MediaQueryList>();
const callbacks = createCallbackManager();
const DEBOUNCE_MS = 100;

const QUERIES = {
  [EMediaQueryKey.Mobile]: `(max-width: ${MOBILE_SCREEN_MAX_WIDTH}px), \
  (max-width: ${MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH}px and max-height: ${MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT}px)`,
  [EMediaQueryKey.Tablet]: `(max-width: ${MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN}px)`,
  [EMediaQueryKey.Landscape]: IS_IOS
    ? "(orientation: landscape)"
    : "screen and (min-device-aspect-ratio: 1/1) and (orientation: landscape)",
  [EMediaQueryKey.Touch]: "(pointer: coarse)",
};

let currentState: LayoutState = {
  isMobile: false,
  isTablet: false,
  isLandscape: false,
  isDesktop: false,
  isTouchScreen: false,
};

function initializeMediaQueries() {
  if (typeof window === "undefined") return;

  Object.entries(QUERIES).forEach(([key, query]) => {
    const cacheKey = key as EMediaQueryKey;
    if (!mediaQueryCache.has(cacheKey)) {
      const mq = window.matchMedia(query);
      mediaQueryCache.set(cacheKey, mq);
      mq.addEventListener("change", debouncedHandleMediaQueryChange);
    }
  });

  updateLayoutState();
}

const debouncedHandleMediaQueryChange = debounce(() => {
  updateLayoutState();
  callbacks.runCallbacks();
}, DEBOUNCE_MS);

function updateLayoutState() {
  if (typeof window === "undefined") return;

  const prevState = { ...currentState };

  currentState = {
    isMobile: mediaQueryCache.get(EMediaQueryKey.Mobile)?.matches ?? false,
    isTablet: mediaQueryCache.get(EMediaQueryKey.Tablet)?.matches ?? false,
    isLandscape:
      mediaQueryCache.get(EMediaQueryKey.Landscape)?.matches ?? false,
    isTouchScreen: mediaQueryCache.get(EMediaQueryKey.Touch)?.matches ?? false,
    get isDesktop() {
      return !this.isMobile && !this.isTablet;
    },
  };

  if (JSON.stringify(prevState) !== JSON.stringify(currentState)) {
    callbacks.runCallbacks();
  }
}

if (typeof window !== "undefined") {
  initializeMediaQueries();
}

export function useAppLayout(): LayoutState {
  const [state, setState] = useState(currentState);

  useEffect(() => {
    const callbackId = callbacks.addCallback(() => {
      setState({ ...currentState });
    });

    return () => {
      callbacks.removeCallback(callbackId);
    };
  }, []);

  return useMemo(() => state, [state]);
}

// Optional SSR-safe getters
export function getIsMobile() {
  return typeof window !== "undefined" ? currentState.isMobile : false;
}

export function getIsTablet() {
  return typeof window !== "undefined" ? currentState.isTablet : false;
}
