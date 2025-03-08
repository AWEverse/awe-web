import { debounce } from "@mui/material";
import { IS_IOS } from "../os";
import {
  MOBILE_SCREEN_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT,
  MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN,
} from "@/lib/config/app";

enum EMediaQueryKey {
  Mobile = "mobile",
  Tablet = "tablet",
  Landscape = "landscape",
  Touch = "touch",
}

export type LayoutState = Readonly<{
  isMobile: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isTouchScreen: boolean;
  isDesktop: boolean;
}>;

// Expected results for different environments
// iOS Portrait:      ❌
// iOS Landscape:     ✅
// Android Portrait:  ❌
// Android Landscape: ✅ (both queries)
// Desktop:           ✅ when window ratio ≥ 1/1
// Tablet:            ✅ in landscape mode


let state: LayoutState = {
  isMobile: false,
  isTablet: false,
  isLandscape: false,
  isTouchScreen: false,
  isDesktop: false,
};

const mediaQueryCache = new Map<EMediaQueryKey, MediaQueryList>();
const mediaQueryCleanup = new Map<EMediaQueryKey, () => void>();
const subscribers = new Set<() => void>();
const DEBOUNCE_MS = 100;

const debouncedUpdate = debounce(updateLayoutState, DEBOUNCE_MS);

function initializeMediaQueries() {
  const QUERIES = {
    [EMediaQueryKey.Mobile]: `
    (max-width: ${MOBILE_SCREEN_MAX_WIDTH}px),
    (max-width: ${MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH}px) and
    (max-height: ${MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT}px)
  `,

    [EMediaQueryKey.Tablet]: `
    (min-width: ${MOBILE_SCREEN_MAX_WIDTH + 1}px) and
    (max-width: ${MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN}px)
  `,

    [EMediaQueryKey.Landscape]: IS_IOS
      ? "(orientation: landscape)"
      : `
        (orientation: landscape) and (min-aspect-ratio: 1/1),
        /* Legacy fallback for Android browsers */
        (orientation: landscape) and (min-device-aspect-ratio: 1/1)
      `,

    [EMediaQueryKey.Touch]: `
    (pointer: coarse) or
    (hover: none)
  `,
  };

  Object.entries(QUERIES).forEach(([key, query]) => {
    const mqKey = key as EMediaQueryKey;
    const mq = window.matchMedia(query);
    mediaQueryCache.set(mqKey, mq);

    const listener = () => debouncedUpdate();
    mq.addEventListener("change", listener);
    mediaQueryCleanup.set(mqKey, () =>
      mq.removeEventListener("change", listener),
    );
  });

  updateLayoutState();
}

function updateLayoutState() {
  const newState = {
    isMobile: mediaQueryCache.get(EMediaQueryKey.Mobile)?.matches ?? false,
    isTablet: mediaQueryCache.get(EMediaQueryKey.Tablet)?.matches ?? false,
    isLandscape:
      mediaQueryCache.get(EMediaQueryKey.Landscape)?.matches ?? false,
    isTouchScreen: mediaQueryCache.get(EMediaQueryKey.Touch)?.matches ?? false,
    isDesktop: false,
  };

  newState.isDesktop = !newState.isMobile && !newState.isTablet;

  if (!areStatesEqual(newState)) {
    state = newState;
    notifySubscribers();
  }
}

function areStatesEqual(newState: LayoutState) {
  return (
    state.isMobile === newState.isMobile &&
    state.isTablet === newState.isTablet &&
    state.isLandscape === newState.isLandscape &&
    state.isTouchScreen === newState.isTouchScreen &&
    state.isDesktop === newState.isDesktop
  );
}

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

if (typeof window !== "undefined") {
  initializeMediaQueries();
}

export default {
  subscribe: (callback: () => void) => {
    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);
    };
  },

  getState: () => state,

  destroy: () => {
    mediaQueryCleanup.forEach((cleanup) => cleanup());
    mediaQueryCleanup.clear();
    mediaQueryCache.clear();
    subscribers.clear();
  },
} as const;
