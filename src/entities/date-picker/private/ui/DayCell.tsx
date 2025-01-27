import React, { memo } from "react";

interface DayCellProps {
  children: number;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onContextMenu?: React.MouseEvent | React.TouchEvent;
  onMouseDown?: React.MouseEvent | React.TouchEvent;
  onMouseLeave?: React.MouseEvent | React.TouchEvent;
  onMouseUp?: React.MouseEvent | React.TouchEvent;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
}

const DayCell: React.FC<DayCellProps> = ({
  children,
  className,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseLeave,
  onMouseUp,
  onTouchEnd,
  onTouchStart,
}) => {
  return (
    <div
      className={className}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
    >
      <div>☺</div>
      <span>{children}</span>
    </div>
  );
};

const areEqual = (prev: DayCellProps, next: DayCellProps) =>
  prev.className === next.className &&
  prev.children === next.children &&
  prev.onClick === next.onClick &&
  prev.onContextMenu === next.onContextMenu &&
  prev.onMouseDown === next.onMouseDown &&
  prev.onMouseLeave === next.onMouseLeave &&
  prev.onMouseUp === next.onMouseUp &&
  prev.onTouchEnd === next.onTouchEnd &&
  prev.onTouchStart === next.onTouchStart;

export default memo(DayCell, areEqual);
