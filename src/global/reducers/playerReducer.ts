import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { BaseState } from "../core/GlobalTypes";

// Enhanced types for player state
export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface PlayerOptions {
  readonly minWidth: number;
  readonly minHeight: number;
  readonly maxWidth: number;
  readonly maxHeight: number;
  readonly maintainAspectRatio: boolean;
  readonly aspectRatio: number;
  readonly snapToGrid: boolean;
  readonly gridSize: number;
}

export interface PlayerState extends BaseState {
  readonly position: Position;
  readonly size: Size;
  readonly isResizing: boolean;
  readonly isDragging: boolean;
  readonly isVisible: boolean;
  readonly isMinimized: boolean;
  readonly options: PlayerOptions;
  readonly loading: boolean;
  readonly error: string | null;
  readonly lastValidState?: PlayerState | null;
}

// Action payload types
export interface MoveByPayload {
  readonly deltaX: number;
  readonly deltaY: number;
}

export interface ResizeByPayload {
  readonly deltaWidth: number;
  readonly deltaHeight: number;
}

export interface PositionAndSizePayload {
  readonly position: Position;
  readonly size: Size;
}

export interface SetOptionsPayload extends Partial<PlayerOptions> { }

// Validation utilities
const validatePosition = (position: Position): boolean => {
  return typeof position.x === 'number' &&
    typeof position.y === 'number' &&
    !isNaN(position.x) &&
    !isNaN(position.y);
};

const validateSize = (size: Size, options?: PlayerOptions): boolean => {
  if (typeof size.width !== 'number' || typeof size.height !== 'number' ||
    isNaN(size.width) || isNaN(size.height)) {
    return false;
  }

  if (options) {
    return size.width >= options.minWidth &&
      size.width <= options.maxWidth &&
      size.height >= options.minHeight &&
      size.height <= options.maxHeight;
  }

  return size.width > 0 && size.height > 0;
};

const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

const applyGridSnapping = (position: Position, options: PlayerOptions): Position => {
  if (!options.snapToGrid || options.gridSize <= 0) {
    return position;
  }

  return {
    x: snapToGrid(position.x, options.gridSize),
    y: snapToGrid(position.y, options.gridSize),
  };
};

const constrainSize = (size: Size, options: PlayerOptions): Size => {
  let constrainedSize = {
    width: Math.max(options.minWidth, Math.min(options.maxWidth, size.width)),
    height: Math.max(options.minHeight, Math.min(options.maxHeight, size.height)),
  };

  if (options.maintainAspectRatio) {
    const targetRatio = options.aspectRatio;
    const currentRatio = constrainedSize.width / constrainedSize.height;

    if (currentRatio > targetRatio) {
      constrainedSize.width = constrainedSize.height * targetRatio;
    } else {
      constrainedSize.height = constrainedSize.width / targetRatio;
    }

    // Re-apply constraints after aspect ratio correction
    constrainedSize = {
      width: Math.max(options.minWidth, Math.min(options.maxWidth, constrainedSize.width)),
      height: Math.max(options.minHeight, Math.min(options.maxHeight, constrainedSize.height)),
    };
  }

  return constrainedSize;
};

// Default values as constants
const DEFAULT_POSITION: Position = { x: 0, y: 0 };
const DEFAULT_SIZE: Size = { width: 420, height: 280 };
const DEFAULT_OPTIONS: PlayerOptions = {
  minWidth: 280,
  minHeight: 200,
  maxWidth: 800,
  maxHeight: 600,
  maintainAspectRatio: false,
  aspectRatio: 16 / 9,
  snapToGrid: false,
  gridSize: 10,
};

const initialState: PlayerState = {
  position: DEFAULT_POSITION,
  size: DEFAULT_SIZE,
  isResizing: false,
  isDragging: false,
  isVisible: true,
  isMinimized: false,
  options: DEFAULT_OPTIONS,
  loading: false,
  error: null,
  lastValidState: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Position management with validation and grid snapping
    setPosition: (state, action: PayloadAction<Position>) => {
      const newPosition = action.payload;

      if (!validatePosition(newPosition)) {
        state.error = "Invalid position coordinates";
        return;
      }

      const snappedPosition = applyGridSnapping(newPosition, state.options);
      state.position = snappedPosition;
      state.error = null;
    },

    moveBy: (state, action: PayloadAction<MoveByPayload>) => {
      const { deltaX, deltaY } = action.payload;
      const newPosition = {
        x: state.position.x + deltaX,
        y: state.position.y + deltaY,
      };

      if (!validatePosition(newPosition)) {
        state.error = "Invalid position delta";
        return;
      }

      const snappedPosition = applyGridSnapping(newPosition, state.options);
      state.position = snappedPosition;
      state.error = null;
    },

    // Size management with validation and constraints
    setSize: (state, action: PayloadAction<Size>) => {
      const newSize = action.payload;

      if (!validateSize(newSize, state.options)) {
        state.error = "Invalid size dimensions or outside allowed range";
        return;
      }

      const constrainedSize = constrainSize(newSize, state.options);
      state.size = constrainedSize;
      state.error = null;
    },

    resizeBy: (state, action: PayloadAction<ResizeByPayload>) => {
      const { deltaWidth, deltaHeight } = action.payload;
      const newSize = {
        width: state.size.width + deltaWidth,
        height: state.size.height + deltaHeight,
      };

      if (!validateSize(newSize, state.options)) {
        state.error = "Invalid size delta or outside allowed range";
        return;
      }

      const constrainedSize = constrainSize(newSize, state.options);
      state.size = constrainedSize;
      state.error = null;
    },

    // Combined position and size update (optimized for resize operations)
    setPositionAndSize: (state, action: PayloadAction<PositionAndSizePayload>) => {
      const { position, size } = action.payload;

      if (!validatePosition(position) || !validateSize(size, state.options)) {
        state.error = "Invalid position or size in combined update";
        return;
      }

      const snappedPosition = applyGridSnapping(position, state.options);
      const constrainedSize = constrainSize(size, state.options);

      state.position = snappedPosition;
      state.size = constrainedSize;
      state.error = null;
    },

    // Interaction states
    setIsResizing: (state, action: PayloadAction<boolean>) => {
      if (action.payload && !state.isResizing) {
        // Save current state before starting resize
        state.lastValidState = { ...state };
      }
      state.isResizing = action.payload;
    },

    setIsDragging: (state, action: PayloadAction<boolean>) => {
      if (action.payload && !state.isDragging) {
        // Save current state before starting drag
        state.lastValidState = { ...state };
      }
      state.isDragging = action.payload;
    },

    // Visibility states
    setIsVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },

    setIsMinimized: (state, action: PayloadAction<boolean>) => {
      state.isMinimized = action.payload;
    },

    toggleMinimized: (state) => {
      state.isMinimized = !state.isMinimized;
    },

    toggleVisibility: (state) => {
      state.isVisible = !state.isVisible;
    },

    // Options management with validation
    setOptions: (state, action: PayloadAction<SetOptionsPayload>) => {
      const newOptions = { ...state.options, ...action.payload };

      // Validate new options
      if (newOptions.minWidth >= newOptions.maxWidth ||
        newOptions.minHeight >= newOptions.maxHeight ||
        newOptions.aspectRatio <= 0 ||
        newOptions.gridSize < 0) {
        state.error = "Invalid player options";
        return;
      }

      state.options = newOptions;

      // Re-validate current size with new options
      if (!validateSize(state.size, newOptions)) {
        state.size = constrainSize(state.size, newOptions);
      }

      state.error = null;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // State restoration
    restoreLastValidState: (state) => {
      if (state.lastValidState) {
        Object.assign(state, state.lastValidState);
        state.lastValidState = null;
      }
    },

    // Bulk operations
    resetPlayer: (state) => {
      Object.assign(state, initialState);
    },

    restoreDefaults: (state) => {
      state.position = DEFAULT_POSITION;
      state.size = DEFAULT_SIZE;
      state.options = DEFAULT_OPTIONS;
      state.error = null;
      state.lastValidState = null;
    },
  }
});

export const {
  setPosition,
  moveBy,
  setSize,
  resizeBy,
  setPositionAndSize,
  setIsResizing,
  setIsDragging,
  setIsVisible,
  setIsMinimized,
  toggleMinimized,
  toggleVisibility,
  setOptions,
  clearError,
  restoreLastValidState,
  resetPlayer,
  restoreDefaults,
} = playerSlice.actions;

// Export action types for advanced usage
export type PlayerActions = typeof playerSlice.actions;

export default playerSlice.reducer;
