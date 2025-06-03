import { RootState } from "../core";
import { PlayerState } from "../reducers/playerReducer";
import {
  createMemoizedSelector,
  createParametrizedSelector,
  createConditionalSelector,
} from "../core/selectors";

// Base selectors
export const selectPlayerState = (state: RootState): PlayerState => state.player;

// Memoized basic selectors using new utilities
export const selectPlayerPosition = createMemoizedSelector(
  [selectPlayerState],
  (player) => player.position
);

export const selectPlayerSize = createMemoizedSelector(
  [selectPlayerState],
  (player) => player.size
);

export const selectPlayerOptions = createMemoizedSelector(
  [selectPlayerState],
  (player) => player.options
);

export const selectPlayerError = createMemoizedSelector(
  [selectPlayerState],
  (player) => player.error
);

export const selectPlayerLoading = createMemoizedSelector(
  [selectPlayerState],
  (player) => player.loading
);

// Enhanced interaction state selector
export const selectPlayerInteractionState = createMemoizedSelector(
  [selectPlayerState],
  (player) => ({
    isResizing: player.isResizing,
    isDragging: player.isDragging,
    isInteracting: player.isResizing || player.isDragging,
    hasLastValidState: Boolean(player.lastValidState),
  })
);

// Enhanced visibility state selector
export const selectPlayerVisibilityState = createMemoizedSelector(
  [selectPlayerState],
  (player) => ({
    isVisible: player.isVisible,
    isMinimized: player.isMinimized,
    isFullyVisible: player.isVisible && !player.isMinimized,
  })
);

// Combined selectors for component props
export const selectPlayerGeometry = createMemoizedSelector(
  [selectPlayerPosition, selectPlayerSize],
  (position, size) => ({ position, size })
);

export const selectPlayerStateForComponent = createMemoizedSelector(
  [
    selectPlayerGeometry,
    selectPlayerInteractionState,
    selectPlayerVisibilityState,
    selectPlayerError,
    selectPlayerLoading
  ],
  (geometry, interactions, visibility, error, loading) => ({
    ...geometry,
    ...interactions,
    ...visibility,
    error,
    loading,
  })
);

// Computed selectors with enhanced functionality
export const selectPlayerTransform = createMemoizedSelector(
  [selectPlayerPosition],
  (position) => `translate(${position.x}px, ${position.y}px)`
);

export const selectPlayerDimensions = createMemoizedSelector(
  [selectPlayerSize, selectPlayerVisibilityState],
  (size, { isMinimized, isVisible }) => ({
    width: `${size.width}px`,
    height: isMinimized ? "40px" : `${size.height}px`,
    opacity: isVisible ? 1 : 0,
  })
);

export const selectPlayerContainerStyle = createMemoizedSelector(
  [selectPlayerTransform, selectPlayerDimensions],
  (transform, dimensions) => ({
    transform,
    ...dimensions,
    transition: 'all 0.2s ease-in-out',
  })
);

// Parametrized selectors for dynamic values
export const selectPlayerBounds = createParametrizedSelector(
  (padding: number = 0) => createMemoizedSelector(
    [selectPlayerPosition, selectPlayerSize],
    (position, size) => ({
      left: position.x - padding,
      top: position.y - padding,
      right: position.x + size.width + padding,
      bottom: position.y + size.height + padding,
      width: size.width + 2 * padding,
      height: size.height + 2 * padding,
    })
  )
);

export const selectPlayerWithinBounds = createParametrizedSelector(
  (bounds: { width: number; height: number }) => createMemoizedSelector(
    [selectPlayerPosition, selectPlayerSize],
    (position, size) => ({
      isWithinBounds:
        position.x >= 0 &&
        position.y >= 0 &&
        position.x + size.width <= bounds.width &&
        position.y + size.height <= bounds.height,
      exceedsWidth: position.x + size.width > bounds.width,
      exceedsHeight: position.y + size.height > bounds.height,
    })
  )
);

// Conditional selectors
export const selectPlayerErrorState = createConditionalSelector(
  selectPlayerError,
  (error) => Boolean(error),
  (error: string | null) => ({ hasError: true, error }),
  () => ({ hasError: false, error: null }),
);

export const selectPlayerCanResize = createConditionalSelector(
  createMemoizedSelector(
    [selectPlayerInteractionState, selectPlayerOptions],
    (interactions, options) => ({ interactions, options })
  ),
  ({ interactions, options }) =>
    !interactions.isDragging &&
    options.maxWidth > options.minWidth &&
    options.maxHeight > options.minHeight,
  () => ({ canResize: true, reason: null as string | null }),
  ({ options }) => ({
    canResize: false,
    reason: (options.maxWidth <= options.minWidth ? 'Width constraints invalid' : 'Height constraints invalid') as string | null
  }),
);

// Utility selectors for validation
export const selectPlayerValidationState = createMemoizedSelector(
  [selectPlayerPosition, selectPlayerSize, selectPlayerOptions],
  (position, size, options) => ({
    isValidPosition: !isNaN(position.x) && !isNaN(position.y),
    isValidSize:
      size.width >= options.minWidth &&
      size.width <= options.maxWidth &&
      size.height >= options.minHeight &&
      size.height <= options.maxHeight,
    aspectRatioMatch: options.maintainAspectRatio
      ? Math.abs((size.width / size.height) - options.aspectRatio) < 0.01
      : true,
  })
);
