import { useSyncExternalStore } from "react";
import LayoutManager, {
  type LayoutState,
} from "@/lib/core/public/window/LayoutManager";
import { IS_BROWSER } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";

type SelectorPayload<T> = (state: LayoutState) => T;

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
export default function useAppLayout<T = LayoutState>(
  selector: SelectorPayload<T> = (state) => state as unknown as T,
): T {
  const _selector = useStableCallback(selector);

  const snapshot = useStableCallback(() => _selector(LayoutManager.getState()));
  const snapshotSSR = useStableCallback(() => _selector(SERVER_SNAPSHOT));

  return useSyncExternalStore(LayoutManager.subscribe, snapshot, snapshotSSR);
}

export const getIsMobile = () => getLayoutState().isMobile;
export const getIsTablet = () => getLayoutState().isTablet;
export const getIsLandscape = () => getLayoutState().isLandscape;
export const getIsDesktop = () => getLayoutState().isDesktop;
export const getIsTouchScreen = () => getLayoutState().isTouchScreen;
