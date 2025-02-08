import { useSyncExternalStore } from "react";
import LayoutManager, {
  type LayoutState,
} from "@/lib/core/public/window/LayoutManager";
import { IS_BROWSER } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";

const SERVER_SNAPSHOT: LayoutState = {
  isMobile: false,
  isTablet: false,
  isLandscape: false,
  isDesktop: false,
  isTouchScreen: false,
};

export function useAppLayout(): LayoutState;
export function useAppLayout<T>(selector: (state: LayoutState) => T): T;
export function useAppLayout<T>(selector?: (state: LayoutState) => T) {
  const _selector = useStableCallback(
    selector ?? ((state) => state as unknown as T),
  );

  return useSyncExternalStore(
    LayoutManager.subscribe,
    () => _selector(LayoutManager.getState()),
    () => _selector(SERVER_SNAPSHOT), // SSR fallback
  );
}

export const getLayoutState = () =>
  IS_BROWSER ? LayoutManager.getState() : SERVER_SNAPSHOT;

export const getIsMobile = () => getLayoutState().isMobile;
export const getIsTablet = () => getLayoutState().isTablet;
export const getIsLandscape = () => getLayoutState().isLandscape;
export const getIsDesktop = () => getLayoutState().isDesktop;
export const getIsTouchScreen = () => getLayoutState().isTouchScreen;
