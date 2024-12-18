import React, { memo } from 'react';
import buildClassName from '@/shared/lib/buildClassName';

interface DayCellProps {
  day: number;
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  isSelectedDay: boolean;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent | React.TouchEvent) => void;
  onMouseDown: (event: React.MouseEvent | React.TouchEvent) => void;
  onMouseLeave: (event: React.MouseEvent | React.TouchEvent) => void;
  onMouseUp: (event: React.MouseEvent | React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTouchStart: (event: React.TouchEvent) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
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
  const className = buildClassName(
    'calendarCell',
    'dayCell',
    !isCurrentMonth && 'another',
    isSelectedDay && 'selectedDay',
    isCurrentDay && 'currentDay',
  );

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
      {day}
    </div>
  );
};

export default memo(DayCell);
