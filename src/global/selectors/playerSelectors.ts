import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../core";
import { PlayerState } from "../reducers/playerReducer";

export const selectPlayerState = (state: RootState): PlayerState => state.player;

export const selectPlayerPosition = createSelector(
  [selectPlayerState],
  (player) => player.position
);

export const selectPlayerSize = createSelector(
  [selectPlayerState],
  (player) => player.size
);

export const selectPlayerOptions = createSelector(
  [selectPlayerState],
  (player) => player.options
);

export const selectPlayerInteractionState = createSelector(
  [selectPlayerState],
  (player) => ({
    isResizing: player.isResizing,
    isDragging: player.isDragging,
  })
);

export const selectPlayerVisibilityState = createSelector(
  [selectPlayerState],
  (player) => ({
    isVisible: player.isVisible,
    isMinimized: player.isMinimized,
  })
);

// Combined selectors for component props
export const selectPlayerGeometry = createSelector(
  [selectPlayerPosition, selectPlayerSize],
  (position, size) => ({ position, size })
);

export const selectPlayerStateForComponent = createSelector(
  [selectPlayerGeometry, selectPlayerInteractionState, selectPlayerVisibilityState],
  (geometry, interactions, visibility) => ({
    ...geometry,
    ...interactions,
    ...visibility,
  })
);

// Computed selectors
export const selectPlayerTransform = createSelector(
  [selectPlayerPosition],
  (position) => `translate(${position.x}px, ${position.y}px)`
);

export const selectPlayerDimensions = createSelector(
  [selectPlayerSize, selectPlayerVisibilityState],
  (size, { isMinimized }) => ({
    width: `${size.width}px`,
    height: isMinimized ? "40px" : `${size.height}px`,
  })
);

export const selectPlayerContainerStyle = createSelector(
  [selectPlayerTransform, selectPlayerDimensions],
  (transform, dimensions) => ({
    transform,
    ...dimensions,
  })
);
