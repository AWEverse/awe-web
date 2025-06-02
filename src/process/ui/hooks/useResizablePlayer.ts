import { useStableCallback } from '@/shared/hooks/base';
import { useState, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ResizablePlayerOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
  snapToGrid?: boolean;
  gridSize?: number;
}

export interface UseResizablePlayerReturn {
  position: Position;
  size: Size;
  setPosition: (position: Position) => void;
  setSize: (size: Size) => void;
  constrainToViewport: (newPosition: Position, newSize: Size) => { position: Position; size: Size };
  snapToEdges: (position: Position, size: Size, threshold?: number) => Position;
  resizeWithPosition: (newPosition: Position, newSize: Size) => void;
}

const DEFAULT_OPTIONS: Required<ResizablePlayerOptions> = {
  minWidth: 280,
  minHeight: 200,
  maxWidth: 800,
  maxHeight: 600,
  maintainAspectRatio: false,
  aspectRatio: 16 / 9,
  snapToGrid: false,
  gridSize: 10,
};

export function useResizablePlayer(
  initialPosition: Position = { x: 0, y: 0 },
  initialSize: Size = { width: 420, height: 280 },
  options: ResizablePlayerOptions = {}
): UseResizablePlayerReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [position, setPositionState] = useState<Position>(initialPosition);
  const [size, setSizeState] = useState<Size>(initialSize);

  const constrainSize = useCallback((newSize: Size): Size => {
    let { width, height } = newSize;

    width = Math.max(opts.minWidth, Math.min(opts.maxWidth, width));
    height = Math.max(opts.minHeight, Math.min(opts.maxHeight, height));

    if (opts.maintainAspectRatio) {
      const currentRatio = width / height;
      if (currentRatio > opts.aspectRatio) {
        width = height * opts.aspectRatio;
      } else {
        height = width / opts.aspectRatio;
      }
    }

    if (opts.snapToGrid) {
      width = Math.round(width / opts.gridSize) * opts.gridSize;
      height = Math.round(height / opts.gridSize) * opts.gridSize;
    }

    return { width, height };
  }, [opts]);
  const constrainToViewport = useCallback((newPosition: Position, newSize: Size) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const constrainedSize = constrainSize(newSize);

    // Ensure position doesn't go negative and stays within viewport
    const constrainedPosition = {
      x: Math.max(0, Math.min(viewportWidth - constrainedSize.width, newPosition.x)),
      y: Math.max(0, Math.min(viewportHeight - constrainedSize.height, newPosition.y)),
    };

    return {
      position: constrainedPosition,
      size: constrainedSize,
    };
  }, [constrainSize]);

  const snapToEdges = useStableCallback((position: Position, size: Size, threshold: number = 20): Position => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    if (x < threshold) x = 0;
    else if (x + size.width > viewportWidth - threshold) x = viewportWidth - size.width;

    if (y < threshold) y = 0;
    else if (y + size.height > viewportHeight - threshold) y = viewportHeight - size.height;

    return { x, y };
  });

  const setPosition = useCallback((newPosition: Position) => {
    const { position: constrainedPosition } = constrainToViewport(newPosition, size);
    setPositionState(constrainedPosition);
  }, [size, constrainToViewport]);
  const setSize = useCallback((newSize: Size) => {
    const { position: constrainedPosition, size: constrainedSize } = constrainToViewport(position, newSize);
    setSizeState(constrainedSize);
    setPositionState(constrainedPosition);
  }, [position, constrainToViewport]);

  const resizeWithPosition = useCallback((newPosition: Position, newSize: Size) => {
    const { position: constrainedPosition, size: constrainedSize } = constrainToViewport(newPosition, newSize);
    setSizeState(constrainedSize);
    setPositionState(constrainedPosition);
  }, [constrainToViewport]);

  return {
    position,
    size,
    setPosition,
    setSize,
    constrainToViewport,
    snapToEdges,
    resizeWithPosition,
  };
}
