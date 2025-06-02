// Types for player state
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PlayerOptions {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  aspectRatio: number;
  snapToGrid: boolean;
  gridSize: number;
}

export interface PlayerState {
  position: Position;
  size: Size;
  isResizing: boolean;
  isDragging: boolean;
  isVisible: boolean;
  isMinimized: boolean;
  options: PlayerOptions;
}

// Action payload types
export interface MoveByPayload {
  deltaX: number;
  deltaY: number;
}

export interface ResizeByPayload {
  deltaWidth: number;
  deltaHeight: number;
}

export interface SetPositionAndSizePayload {
  position: Position;
  size: Size;
}

// Component prop types for better separation
export interface PlayerGeometry {
  position: Position;
  size: Size;
}

export interface PlayerInteractionState {
  isResizing: boolean;
  isDragging: boolean;
}

export interface PlayerVisibilityState {
  isVisible: boolean;
  isMinimized: boolean;
}

export interface PlayerContainerStyles {
  transform: string;
  width: string;
  height: string;
}
