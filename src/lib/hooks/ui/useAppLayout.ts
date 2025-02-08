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

const getLayoutState = () => {
  return IS_BROWSER ? LayoutManager.getState() : SERVER_SNAPSHOT;
};

export default function useAppLayout(): LayoutState;
export default function useAppLayout<T>(selector: (state: LayoutState) => T): T;
export default function useAppLayout<T>(selector?: (state: LayoutState) => T) {
  const _selector = useStableCallback(
    selector ?? ((state: LayoutState) => state as unknown as T),
  );

  const snapshot = () => _selector(LayoutManager.getState());
  const snapshotSSR = () => _selector(SERVER_SNAPSHOT); // SSR fallback

  return useSyncExternalStore(LayoutManager.subscribe, snapshot, snapshotSSR);
}

export const getIsMobile = () => getLayoutState().isMobile;
export const getIsTablet = () => getLayoutState().isTablet;
export const getIsLandscape = () => getLayoutState().isLandscape;
export const getIsDesktop = () => getLayoutState().isDesktop;
export const getIsTouchScreen = () => getLayoutState().isTouchScreen;
