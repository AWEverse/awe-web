import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/global/core";
import {
  PlayerState,
  PlayerGeometry,
  PlayerInteractionState,
  PlayerVisibilityState,
  PlayerContainerStyles,
} from "./types";
import { memoize } from "@/shared/lib/performance";

// === Base Selectors ===
/**
 * Root selector for player state
 */
export const selectPlayerState = (state: RootState): PlayerState => state.player;

// === Property Selectors ===
/**
 * Select player position
 */
export const selectPlayerPosition = createSelector(
  [selectPlayerState],
  (player) => player.position
);

/**
 * Select player size
 */
export const selectPlayerSize = createSelector(
  [selectPlayerState],
  (player) => player.size
);

/**
 * Select player options/constraints
 */
export const selectPlayerOptions = createSelector(
  [selectPlayerState],
  (player) => player.options
);

// === State Grouping Selectors ===
/**
 * Select interaction state (dragging, resizing)
 */
export const selectPlayerInteractionState = createSelector(
  [selectPlayerState],
  (player): PlayerInteractionState => ({
    isResizing: player.isResizing,
    isDragging: player.isDragging,
  })
);

/**
 * Select visibility state (visible, minimized)
 */
export const selectPlayerVisibilityState = createSelector(
  [selectPlayerState],
  (player): PlayerVisibilityState => ({
    isVisible: player.isVisible,
    isMinimized: player.isMinimized,
  })
);

/**
 * Select geometry (position + size)
 */
export const selectPlayerGeometry = createSelector(
  [selectPlayerPosition, selectPlayerSize],
  (position, size): PlayerGeometry => ({ position, size })
);

// === Component-Specific Selectors ===
/**
 * Select all state needed for PersistentPlayer component
 */
export const selectPlayerStateForComponent = createSelector(
  [selectPlayerGeometry, selectPlayerInteractionState, selectPlayerVisibilityState],
  (geometry, interactions, visibility) => ({
    ...geometry,
    ...interactions,
    ...visibility,
  })
);

// === Computed/Derived Selectors ===
/**
 * Compute CSS transform string for positioning
 */
export const selectPlayerTransform = createSelector(
  [selectPlayerPosition],
  (position) => `translate(${position.x}px, ${position.y}px)`
);

/**
 * Compute CSS dimensions with minimized state handling
 */
export const selectPlayerDimensions = createSelector(
  [selectPlayerSize, selectPlayerVisibilityState],
  (size, { isMinimized }) => ({
    width: `${size.width}px`,
    height: isMinimized ? "40px" : `${size.height}px`,
  })
);

/**
 * Complete container styles for direct CSS application
 */
export const selectPlayerContainerStyle = createSelector(
  [selectPlayerTransform, selectPlayerDimensions],
  (transform, dimensions): PlayerContainerStyles => ({
    transform,
    ...dimensions,
  })
);

// === Utility Selectors ===
/**
 * Check if player is maximized (based on size thresholds)
 */
export const selectIsPlayerMaximized = createSelector(
  [selectPlayerSize],
  (size) => size.width >= 750
);

/**
 * Check if player can be maximized (not already at max size)
 */
export const selectCanMaximize = createSelector(
  [selectPlayerSize, selectPlayerOptions],
  (size, options) => size.width < options.maxWidth || size.height < options.maxHeight
);

/**
 * Check if player can be minimized to tray
 */
export const selectCanMinimize = createSelector(
  [selectPlayerVisibilityState],
  (visibility) => visibility.isVisible && !visibility.isMinimized
);

/**
 * Select player aspect ratio
 */
export const selectPlayerAspectRatio = createSelector(
  [selectPlayerSize],
  (size) => size.width / size.height
);

// === Performance Optimized Selectors ===
/**
 * Lightweight selector for drag operations (frequently updated)
 */
export const selectPlayerPositionForDrag = memoize(
  createSelector(
    [selectPlayerPosition],
    (position) => ({
      x: position.x,
      y: position.y,
    })
  )
);

/**
 * Lightweight selector for resize operations (frequently updated)
 */
export const selectPlayerSizeForResize = memoize(
  createSelector(
    [selectPlayerSize],
    (size) => ({
      width: size.width,
      height: size.height,
    })
  )
);
