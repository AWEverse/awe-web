import { useState } from "react";
import { useStateRef } from "@/shared/hooks/base";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import LayoutManager, {
  type LayoutState,
} from "@/lib/core/public/window/LayoutManager";

export function getIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getState().isMobile;
}

export function getIsTablet(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getState().isTablet;
}

export function getIsLandscape(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getState().isLandscape;
}

export function getIsDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getState().isDesktop;
}

export function getIsTouchScreen(): boolean {
  if (typeof window === "undefined") return false;
  return LayoutManager.getState().isTouchScreen;
}

export default function useAppLayout(): LayoutState {
  const layoutManager = useStateRef(LayoutManager);

  const [state, setState] = useState<LayoutState>(
    layoutManager.current.getState(),
  );

  useComponentDidMount(() => {
    const unsubscribe = layoutManager.current.subscribe(() => {
      setState({ ...layoutManager.current.getState() });
    });

    return () => {
      unsubscribe();
    };
  });

  return state;
}

// [---------------------------App lifecycle--------------------------------]
//                                 [--------------use App Layout------------]
// For exampe during by nested component across full time lifecylce we using only one wersion of
