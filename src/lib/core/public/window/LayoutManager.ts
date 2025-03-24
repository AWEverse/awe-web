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

const createLayoutDetector = () => {
  let state: LayoutState = {
    isMobile: false,
    isTablet: false,
    isLandscape: false,
    isTouchScreen: false,
    isDesktop: false,
  };

  const mediaQueryCache = new Map<EMediaQueryKey, MediaQueryList>();
  const subscribers = new Set<() => void>();

  let updateScheduled = false;

  function scheduleUpdate() {
    if (!updateScheduled) {
      updateScheduled = true;

      requestAnimationFrame(() => {
        updateLayoutState();
        updateScheduled = false;
      });
    }
  }

  function updateLayoutState() {
    const newState = {
      isMobile: Boolean(mediaQueryCache.get(EMediaQueryKey.Mobile)?.matches),
      isTablet: Boolean(mediaQueryCache.get(EMediaQueryKey.Tablet)?.matches),
      isLandscape: Boolean(
        mediaQueryCache.get(EMediaQueryKey.Landscape)?.matches,
      ),
      isTouchScreen: Boolean(
        mediaQueryCache.get(EMediaQueryKey.Touch)?.matches,
      ),
      isDesktop: false,
    };

    newState.isDesktop = !newState.isMobile && !newState.isTablet;

    if (!areStatesEqual(state, newState)) {
      state = newState;
      notifySubscribers();
    }
  }

  function areStatesEqual(oldState: LayoutState, newState: LayoutState) {
    return (
      oldState.isMobile === newState.isMobile &&
      oldState.isTablet === newState.isTablet &&
      oldState.isLandscape === newState.isLandscape &&
      oldState.isTouchScreen === newState.isTouchScreen &&
      oldState.isDesktop === newState.isDesktop
    );
  }

  function notifySubscribers() {
    subscribers.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error in layout subscriber:", error);
      }
    });
  }

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

      // Optimized landscape detection with improved cross-browser compatibility
      [EMediaQueryKey.Landscape]: IS_IOS
        ? "(orientation: landscape)"
        : `
            (orientation: landscape) and (min-aspect-ratio: 1/1),
            (orientation: landscape) and (min-device-aspect-ratio: 1/1)
          `,

      [EMediaQueryKey.Touch]: `
        (pointer: coarse) or
        (hover: none)
      `,
    };

    const handleMediaQueryChange = () => scheduleUpdate();

    Object.entries(QUERIES).forEach(([key, query]) => {
      const mqKey = key as EMediaQueryKey;
      try {
        const mq = window.matchMedia(query);
        mediaQueryCache.set(mqKey, mq);
        mq.addEventListener("change", handleMediaQueryChange);
      } catch (error) {
        console.error(`Failed to create media query for ${mqKey}:`, error);
      }
    });

    updateLayoutState();
  }

  let initialized = false;

  function ensureInitialized() {
    if (!initialized && typeof window !== "undefined") {
      initialized = true;
      initializeMediaQueries();
    }
  }

  return {
    subscribe: (callback: () => void) => {
      ensureInitialized();
      subscribers.add(callback);

      // Immediately call with current state to sync new subscriber
      try {
        callback();
      } catch (error) {
        console.error(
          "Error in layout subscriber during initialization:",
          error,
        );
      }

      return () => {
        subscribers.delete(callback);
      };
    },

    getState: () => {
      ensureInitialized();
      return state;
    },

    destroy: () => {
      if (!initialized) return;

      // Clean up all listeners with a single handler reference
      const handleMediaQueryChange = () => scheduleUpdate();
      mediaQueryCache.forEach((mq) => {
        mq.removeEventListener("change", handleMediaQueryChange);
      });

      mediaQueryCache.clear();
      subscribers.clear();
      initialized = false;
    },
  } as const;
};

const layoutDetector =
  typeof window !== "undefined" ? createLayoutDetector() : null;

// Export the singleton or a dummy implementation for SSR
export default {
  subscribe: (callback: () => void) => {
    return layoutDetector ? layoutDetector.subscribe(callback) : () => { };
  },

  getState: () => {
    return layoutDetector
      ? layoutDetector.getState()
      : {
        isMobile: false,
        isTablet: false,
        isLandscape: false,
        isTouchScreen: false,
        isDesktop: true,
      };
  },

  destroy: () => {
    if (layoutDetector) layoutDetector.destroy();
  },
} as const;
