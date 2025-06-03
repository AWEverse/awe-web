import { useState, useRef, useCallback, useEffect, memo, FC } from "react";
import { VideoPlayer } from "@/widgets/video-player";
import buildClassName from "@/shared/lib/buildClassName";
import stopEvent from "@/lib/utils/stopEvent";
import { useResizablePlayer, Position, Size } from "./hooks/useResizablePlayer";
import { withGlobalState } from "@/global/hocs/withGlobalState";

import "./PersistentPlayer.scss";
import { useStableCallback } from "@/shared/hooks/base";

type DragState = {
  isDragging: boolean;
  dragStart: Position;
  initialPosition: Position;
};

type ResizeState = {
  isResizing: boolean;
  resizeStart: Position;
  initialSize: Size;
  initialPosition: Position;
  resizeHandle: string;
};

type OwnProps = ReadonlyPartial<{
  showControlPanel?: boolean;
  className?: string;
  videoPlayerProps?: {
    totalFileSize?: number;
    playbackSpeed?: number;
    isAudioMuted?: boolean;
  };
  onClose?: () => void;
  onStateChange?: (state: { isVisible: boolean; isMinimized: boolean }) => void;
}>;

type StateProps = ReadonlyPartial<{
  position: Position;
  size: Size;
  isResizing: boolean;
  isDragging: boolean;
  isVisible: boolean;
  isMinimized: boolean;
  containerStyle: React.CSSProperties;
}>;

const PersistentPlayer: FC<OwnProps & StateProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(false);

  const {
    position,
    size,
    setPosition,
    constrainToViewport,
    snapToEdges,
    resizeWithPosition,
  } = useResizablePlayer(
    { x: 0, y: 0 },
    { width: 420, height: 280 },
    {
      minWidth: 280,
      minHeight: 200,
      maxWidth: 800,
      maxHeight: 600,
      maintainAspectRatio: false,
      snapToGrid: false,
    },
  );

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    initialPosition: { x: 0, y: 0 },
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizeStart: { x: 0, y: 0 },
    initialSize: { width: 420, height: 280 },
    initialPosition: { x: 0, y: 0 },
    resizeHandle: "",
  });

  const getClientCoordinates = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
  ) => {
    const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
    return { x: clientX, y: clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest(".PersistentPlayer-dragHandle") &&
      target.closest(".VideoPlayer")
    ) {
      return;
    }

    stopEvent(e);
    const { x, y } = getClientCoordinates(e);

    setDragState({
      isDragging: true,
      dragStart: { x, y },
      initialPosition: position,
    });
  };

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragState.isDragging) return;

      const { x, y } = getClientCoordinates(e);
      const deltaX = x - dragState.dragStart.x;
      const deltaY = y - dragState.dragStart.y;

      const newPosition = {
        x: dragState.initialPosition.x + deltaX,
        y: dragState.initialPosition.y + deltaY,
      };

      const { position: constrainedPosition } = constrainToViewport(
        newPosition,
        size,
      );
      setPosition(constrainedPosition);
    },
    [dragState, size, constrainToViewport, setPosition],
  );

  const handleDragEnd = useCallback(() => {
    const snappedPosition = snapToEdges(position, size, 30);
    setPosition(snappedPosition);

    setDragState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  }, [position, size, snapToEdges, setPosition]);

  const handleClose = useStableCallback(() => {
    setIsVisible(false);
  });

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const handleMaximize = useCallback(() => {
    const maxSize = { width: 800, height: 600 };
    resizeWithPosition(position, maxSize);
  }, [position, resizeWithPosition]);

  const handleRestore = useCallback(() => {
    const defaultSize = { width: 420, height: 280 };
    resizeWithPosition(position, defaultSize);
  }, [position, resizeWithPosition]);

  const handleMouseEnter = useStableCallback(() => {
    setIsControlPanelVisible(true);
  });

  const handleMouseLeave = useStableCallback(() => {
    setIsControlPanelVisible(false);
  });

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    handle: string,
  ) => {
    stopEvent(e);
    const { x, y } = getClientCoordinates(e);

    setResizeState({
      isResizing: true,
      resizeStart: { x, y },
      initialSize: size,
      initialPosition: position,
      resizeHandle: handle,
    });
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!resizeState.isResizing) return;

      const { x, y } = getClientCoordinates(e);
      const deltaX = x - resizeState.resizeStart.x;
      const deltaY = y - resizeState.resizeStart.y;

      let newSize = { ...resizeState.initialSize };
      let newPosition = { ...resizeState.initialPosition };

      const { resizeHandle } = resizeState;

      if (resizeHandle.includes("right")) {
        newSize.width = resizeState.initialSize.width + deltaX;
      }
      if (resizeHandle.includes("left")) {
        const widthChange = -deltaX;
        newSize.width = resizeState.initialSize.width + widthChange;
        const actualWidthChange = newSize.width - resizeState.initialSize.width;
        newPosition.x = resizeState.initialPosition.x - actualWidthChange;
      }
      if (resizeHandle.includes("bottom")) {
        newSize.height = resizeState.initialSize.height + deltaY;
      }
      if (resizeHandle.includes("top")) {
        const heightChange = -deltaY;
        newSize.height = resizeState.initialSize.height + heightChange;
        const actualHeightChange =
          newSize.height - resizeState.initialSize.height;
        newPosition.y = resizeState.initialPosition.y - actualHeightChange;
      }

      resizeWithPosition(newPosition, newSize);
    },
    [resizeState, resizeWithPosition],
  );

  const handleResizeEnd = useCallback(() => {
    setResizeState((prev) => ({
      ...prev,
      isResizing: false,
    }));
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
      window.addEventListener("touchcancel", handleDragEnd);

      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
        window.removeEventListener("touchcancel", handleDragEnd);
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (resizeState.isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
      window.addEventListener("touchmove", handleResizeMove);
      window.addEventListener("touchend", handleResizeEnd);
      window.addEventListener("touchcancel", handleResizeEnd);

      return () => {
        window.removeEventListener("mousemove", handleResizeMove);
        window.removeEventListener("mouseup", handleResizeEnd);
        window.removeEventListener("touchmove", handleResizeMove);
        window.removeEventListener("touchend", handleResizeEnd);
        window.removeEventListener("touchcancel", handleResizeEnd);
      };
    }
  }, [resizeState.isResizing, handleResizeMove, handleResizeEnd]);
  const containerStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: `${size.width}px`,
    height: isMinimized ? "40px" : `${size.height}px`,
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={buildClassName(
        "PersistentPlayer",
        dragState.isDragging && "PersistentPlayer--dragging",
        resizeState.isResizing && "PersistentPlayer--resizing",
        isMinimized && "PersistentPlayer--minimized",
      )}
      style={containerStyle}
      data-testid="PersistentPlayer"
      role="region"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Control Panel */}
      <div
        className={buildClassName(
          "PersistentPlayer-controlPanel",
          isControlPanelVisible && "PersistentPlayer-controlPanel--visible",
        )}
      >
        <div className="PersistentPlayer-controlPanel-buttons">
          <button
            className="PersistentPlayer-controlButton PersistentPlayer-controlButton--minimize"
            onClick={handleMinimize}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            <i
              className={`icon ${isMinimized ? "icon-expand" : "icon-minimize"}`}
            />
          </button>
          <button
            className="PersistentPlayer-controlButton PersistentPlayer-controlButton--maximize"
            onClick={size.width >= 750 ? handleRestore : handleMaximize}
            title={size.width >= 750 ? "Restore" : "Maximize"}
          >
            <i
              className={`icon ${size.width >= 750 ? "icon-restore" : "icon-maximize"}`}
            />
          </button>
          <button
            className="PersistentPlayer-controlButton PersistentPlayer-controlButton--close"
            onClick={handleClose}
            title="Close"
          >
            <i className="icon icon-close" />
          </button>
        </div>
      </div>

      <div
        className="PersistentPlayer-dragHandle"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        title="Drag to move player"
      >
        <i className="icon icon-menu" />
      </div>

      {resizeState.isResizing && (
        <div className="PersistentPlayer-sizeIndicator">
          {Math.round(size.width)} × {Math.round(size.height)}
        </div>
      )}

      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--top"
        onMouseDown={(e) => handleResizeStart(e, "top")}
        onTouchStart={(e) => handleResizeStart(e, "top")}
      />
      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--right"
        onMouseDown={(e) => handleResizeStart(e, "right")}
        onTouchStart={(e) => handleResizeStart(e, "right")}
      />
      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--bottom"
        onMouseDown={(e) => handleResizeStart(e, "bottom")}
        onTouchStart={(e) => handleResizeStart(e, "bottom")}
      />
      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--left"
        onMouseDown={(e) => handleResizeStart(e, "left")}
        onTouchStart={(e) => handleResizeStart(e, "left")}
      />

      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--top-left"
        onMouseDown={(e) => handleResizeStart(e, "top-left")}
        onTouchStart={(e) => handleResizeStart(e, "top-left")}
      />
      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--top-right"
        onMouseDown={(e) => handleResizeStart(e, "top-right")}
        onTouchStart={(e) => handleResizeStart(e, "top-right")}
      />
      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--bottom-left"
        onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
        onTouchStart={(e) => handleResizeStart(e, "bottom-left")}
      />
      <div
        className="PersistentPlayer-resizeHandle PersistentPlayer-resizeHandle--bottom-right"
        onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
        onTouchStart={(e) => handleResizeStart(e, "bottom-right")}
      />

      {/* Video Player - hidden when minimized */}
      {!isMinimized && (
        <VideoPlayer
          totalFileSize={0}
          playbackSpeed={0}
          isAudioMuted={false}
          disableScrollTracking
          forceMobileVersion
        />
      )}

      {/* Minimized state content */}
      {isMinimized && (
        <div className="PersistentPlayer-minimizedContent">
          <span className="PersistentPlayer-minimizedTitle">Video Player</span>
        </div>
      )}
    </div>
  );
};

export default memo(
  withGlobalState((props) => {
    return {
      ...props,
      position: props.position || { x: 0, y: 0 },
      size: props.size || { width: 420, height: 280 },
      isResizing: props.isResizing || false,
      isDragging: props.isDragging || false,
    };
  })(PersistentPlayer),
);
