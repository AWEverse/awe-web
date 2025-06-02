import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { AppDispatch } from "@/global/core";
import {
  setPosition,
  setSize,
  setPositionAndSize,
  setIsResizing,
  setIsDragging,
  setIsVisible,
  setIsMinimized,
  toggleMinimized,
  toggleVisibility,
  setOptions,
  resetPlayer,
  restoreDefaults,
} from "./playerSlice";
import {
  selectPlayerState,
  selectPlayerPosition,
  selectPlayerSize,
  selectPlayerOptions,
  selectPlayerInteractionState,
  selectPlayerVisibilityState,
  selectPlayerGeometry,
  selectPlayerStateForComponent,
  selectPlayerContainerStyle,
  selectIsPlayerMaximized,
  selectCanMaximize,
  selectCanMinimize,
  selectPlayerAspectRatio,
  selectPlayerPositionForDrag,
  selectPlayerSizeForResize,
} from "./selectors";
import type {
  Position,
  Size,
  PlayerOptions,
  MoveByPayload,
  ResizeByPayload,
  SetPositionAndSizePayload,
} from "./types";

// === Basic State Hooks ===
export const usePlayerState = () => useSelector(selectPlayerState);
export const usePlayerPosition = () => useSelector(selectPlayerPosition);
export const usePlayerSize = () => useSelector(selectPlayerSize);
export const usePlayerOptions = () => useSelector(selectPlayerOptions);

// === Grouped State Hooks ===
export const usePlayerInteractionState = () => useSelector(selectPlayerInteractionState);
export const usePlayerVisibilityState = () => useSelector(selectPlayerVisibilityState);
export const usePlayerGeometry = () => useSelector(selectPlayerGeometry);

// === Component-Specific Hooks ===
export const usePlayerStateForComponent = () => useSelector(selectPlayerStateForComponent);
export const usePlayerContainerStyle = () => useSelector(selectPlayerContainerStyle);

// === Computed State Hooks ===
export const useIsPlayerMaximized = () => useSelector(selectIsPlayerMaximized);
export const useCanMaximize = () => useSelector(selectCanMaximize);
export const useCanMinimize = () => useSelector(selectCanMinimize);
export const usePlayerAspectRatio = () => useSelector(selectPlayerAspectRatio);

// === Performance Optimized Hooks ===
export const usePlayerPositionForDrag = () => useSelector(selectPlayerPositionForDrag);
export const usePlayerSizeForResize = () => useSelector(selectPlayerSizeForResize);

// === Action Hooks ===
export const usePlayerActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return {
    // Position actions
    setPosition: useCallback(
      (position: Position) => dispatch(setPosition(position)),
      [dispatch]
    ),
    moveBy: useCallback(
      (payload: MoveByPayload) => dispatch(setPosition(payload as any)),
      [dispatch]
    ),

    // Size actions
    setSize: useCallback(
      (size: Size) => dispatch(setSize(size)),
      [dispatch]
    ),
    resizeBy: useCallback(
      (payload: ResizeByPayload) => dispatch(setSize(payload as any)),
      [dispatch]
    ),

    // Combined actions
    setPositionAndSize: useCallback(
      (payload: SetPositionAndSizePayload) => dispatch(setPositionAndSize(payload)),
      [dispatch]
    ),

    // Interaction state actions
    setIsResizing: useCallback(
      (isResizing: boolean) => dispatch(setIsResizing(isResizing)),
      [dispatch]
    ),
    setIsDragging: useCallback(
      (isDragging: boolean) => dispatch(setIsDragging(isDragging)),
      [dispatch]
    ),

    // Visibility actions
    setIsVisible: useCallback(
      (isVisible: boolean) => dispatch(setIsVisible(isVisible)),
      [dispatch]
    ),
    setIsMinimized: useCallback(
      (isMinimized: boolean) => dispatch(setIsMinimized(isMinimized)),
      [dispatch]
    ),
    toggleMinimized: useCallback(
      () => dispatch(toggleMinimized()),
      [dispatch]
    ),
    toggleVisibility: useCallback(
      () => dispatch(toggleVisibility()),
      [dispatch]
    ),

    // Options actions
    setOptions: useCallback(
      (options: Partial<PlayerOptions>) => dispatch(setOptions(options)),
      [dispatch]
    ),

    // Bulk actions
    resetPlayer: useCallback(
      () => dispatch(resetPlayer()),
      [dispatch]
    ),
    restoreDefaults: useCallback(
      () => dispatch(restoreDefaults()),
      [dispatch]
    ),
  };
};

// === Specialized Combined Hooks ===
/**
 * Hook for drag functionality - returns position and actions
 */
export const usePlayerDrag = () => {
  const position = usePlayerPositionForDrag();
  const { setPosition, setIsDragging } = usePlayerActions();

  return {
    position,
    setPosition,
    setIsDragging,
  };
};

/**
 * Hook for resize functionality - returns size, position and actions
 */
export const usePlayerResize = () => {
  const size = usePlayerSizeForResize();
  const position = usePlayerPositionForDrag();
  const { setPositionAndSize, setIsResizing } = usePlayerActions();

  return {
    size,
    position,
    setPositionAndSize,
    setIsResizing,
  };
};

/**
 * Hook for visibility management
 */
export const usePlayerVisibility = () => {
  const visibilityState = usePlayerVisibilityState();
  const { setIsVisible, setIsMinimized, toggleMinimized, toggleVisibility } = usePlayerActions();

  return {
    ...visibilityState,
    setIsVisible,
    setIsMinimized,
    toggleMinimized,
    toggleVisibility,
  };
};

/**
 * Complete hook for player management - returns everything
 */
export const usePlayer = () => {
  const state = usePlayerStateForComponent();
  const containerStyle = usePlayerContainerStyle();
  const actions = usePlayerActions();
  const canMaximize = useCanMaximize();
  const canMinimize = useCanMinimize();
  const isMaximized = useIsPlayerMaximized();

  return {
    // State
    ...state,
    containerStyle,

    // Computed state
    canMaximize,
    canMinimize,
    isMaximized,

    // Actions
    ...actions,
  };
};
