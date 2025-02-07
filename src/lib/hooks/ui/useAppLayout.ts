import { useEffect, useState } from "react";
import {
  MOBILE_SCREEN_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH,
  MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT,
  MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN,
} from "../../config/app";
import { debounce, IS_IOS } from "@/lib/core";

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

const QUERIES = {
  [EMediaQueryKey.Mobile]: `(max-width: ${MOBILE_SCREEN_MAX_WIDTH}px), (max-width: ${MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH}px) and (max-height: ${MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT}px)`,
  [EMediaQueryKey.Tablet]: `(max-width: ${MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN}px)`,
  [EMediaQueryKey.Landscape]: IS_IOS
    ? "(orientation: landscape)"
    : "(orientation: landscape) and (min-device-aspect-ratio: 1/1)",
  [EMediaQueryKey.Touch]: "(pointer: coarse)",
};

class LayoutManager {
  static #instance: LayoutManager;

  private mediaQueryCache: Map<EMediaQueryKey, MediaQueryList> = new Map();
  private state: LayoutState = {
    isMobile: false,
    isTablet: false,
    isLandscape: false,
    isTouchScreen: false,
    isDesktop: false,
  };
  private subscribers: Set<() => void> = new Set();
  private readonly DEBOUNCE_MS = 100;
  private debouncedHandleMediaQueryChange: () => void;

  private constructor() {
    this.debouncedHandleMediaQueryChange = debounce(() => {
      this.updateLayoutState();
    }, this.DEBOUNCE_MS);

    if (typeof window !== "undefined") {
      this.initializeMediaQueries();
    }
  }

  public static getInstance(): LayoutManager {
    if (!LayoutManager.#instance) {
      LayoutManager.#instance = new LayoutManager();
    }
    return LayoutManager.#instance;
  }

  private initializeMediaQueries() {
    Object.entries(QUERIES).forEach(([key, query]) => {
      const mq = window.matchMedia(query);
      this.mediaQueryCache.set(key as EMediaQueryKey, mq);
      mq.addEventListener("change", this.debouncedHandleMediaQueryChange);
    });

    this.updateLayoutState();
  }

  private updateLayoutState() {
    if (typeof window === "undefined") return;

    const newState: LayoutState = {
      isMobile:
        this.mediaQueryCache.get(EMediaQueryKey.Mobile)?.matches ?? false,
      isTablet:
        this.mediaQueryCache.get(EMediaQueryKey.Tablet)?.matches ?? false,
      isLandscape:
        this.mediaQueryCache.get(EMediaQueryKey.Landscape)?.matches ?? false,
      isTouchScreen:
        this.mediaQueryCache.get(EMediaQueryKey.Touch)?.matches ?? false,
      isDesktop: false,
    };

    newState.isDesktop = !newState.isMobile && !newState.isTablet;

    if (JSON.stringify(this.state) !== JSON.stringify(newState)) {
      this.state = newState;
      this.notifySubscribers();
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  public getState(): LayoutState {
    return this.state;
  }
}

export function getIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getInstance().getState().isMobile;
}

export function getIsTablet(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getInstance().getState().isTablet;
}

export function getIsLandscape(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getInstance().getState().isLandscape;
}

export function getIsDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getInstance().getState().isDesktop;
}

export function getIsTouchScreen(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getInstance().getState().isTouchScreen;
}

export default function useAppLayout(): LayoutState {
  const layoutManager = LayoutManager.getInstance();
  const [state, setState] = useState<LayoutState>(layoutManager.getState());

  useEffect(() => {
    const unsubscribe = layoutManager.subscribe(() => {
      setState({ ...layoutManager.getState() });
    });

    return unsubscribe;
  }, [layoutManager]);

  return state;
}
