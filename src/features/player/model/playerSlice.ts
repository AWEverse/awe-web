import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PlayerState,
  Position,
  Size,
  PlayerOptions,
  MoveByPayload,
  ResizeByPayload,
  SetPositionAndSizePayload,
} from "./types";

// Default values as constants
export const DEFAULT_POSITION: Position = { x: 0, y: 0 };
export const DEFAULT_SIZE: Size = { width: 420, height: 280 };
export const DEFAULT_OPTIONS: PlayerOptions = {
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
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Position management
    setPosition: (state, action: PayloadAction<Position>) => {
      state.position = action.payload;
    },
    moveBy: (state, action: PayloadAction<MoveByPayload>) => {
      const { deltaX, deltaY } = action.payload;
      state.position.x += deltaX;
      state.position.y += deltaY;
    },

    // Size management
    setSize: (state, action: PayloadAction<Size>) => {
      state.size = action.payload;
    },
    resizeBy: (state, action: PayloadAction<ResizeByPayload>) => {
      const { deltaWidth, deltaHeight } = action.payload;
      state.size.width += deltaWidth;
      state.size.height += deltaHeight;
    },

    // Combined position and size update (optimized for resize operations)
    setPositionAndSize: (state, action: PayloadAction<SetPositionAndSizePayload>) => {
      const { position, size } = action.payload;
      state.position = position;
      state.size = size;
    },

    // Interaction states
    setIsResizing: (state, action: PayloadAction<boolean>) => {
      state.isResizing = action.payload;
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
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

    // Options management
    setOptions: (state, action: PayloadAction<Partial<PlayerOptions>>) => {
      state.options = { ...state.options, ...action.payload };
    },

    // Bulk operations
    resetPlayer: (state) => {
      Object.assign(state, initialState);
    },
    restoreDefaults: (state) => {
      state.position = DEFAULT_POSITION;
      state.size = DEFAULT_SIZE;
      state.options = DEFAULT_OPTIONS;
    },
  },
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
  resetPlayer,
  restoreDefaults,
} = playerSlice.actions;

export default playerSlice.reducer;
