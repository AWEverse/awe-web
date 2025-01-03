import React, { memo } from 'react';

interface DayCellProps {
  children: number;
  className?: string;
  isCurrentMonth?: boolean;
  isCurrentDay?: boolean;
  isSelectedDay?: boolean;
  onClick?: () => void;
  onContextMenu?: (event: React.MouseEvent | React.TouchEvent) => void;
  onMouseDown?: (event: React.MouseEvent | React.TouchEvent) => void;
  onMouseLeave?: (event: React.MouseEvent | React.TouchEvent) => void;
  onMouseUp?: (event: React.MouseEvent | React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  children,
  className,
  isCurrentMonth,
  isCurrentDay,
  isSelectedDay,
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

export default memo(DayCell);
