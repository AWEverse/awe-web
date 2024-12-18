import React, { useMemo, useCallback, memo } from 'react';

import s from './CircleWithDots.module.css';
import buildClassName from '../lib/buildClassName';

interface CircleWithDotsProps {
  numDots: number;
  radius: number;
  dotRadius: number;
  startAngle: number;
  togetherFromStart?: boolean;
  gap?: number;
  colors?: string[];
  animated?: boolean;
  onClick?: (index: number) => void;
  onDragEnter?: (index: number) => void;
}

const CircleWithDots: React.FC<CircleWithDotsProps> = ({
  numDots,
  radius,
  dotRadius,
  startAngle,
  togetherFromStart = false,
  gap = 0,
  colors = ['red'],
  animated = false,
  onClick,
  onDragEnter,
}) => {
  const startAngleInRadians = useMemo(() => (startAngle * Math.PI) / 180, [startAngle]);
  const gapInRadians = useMemo(() => (gap * Math.PI) / 180, [gap]);

  const handleClick = useCallback(
    (index: number) => () => {
      onClick?.(index);
    },
    [onClick],
  );

  const handleDragEnter = useCallback(
    (index: number) => () => {
      onDragEnter?.(index);
    },
    [onDragEnter],
  );

  const dots = () => {
    const fullCircleInRadians = 2 * Math.PI;
    const angleBetweenDots = fullCircleInRadians / numDots;

    return Array.from({ length: numDots }, (_, i) => {
      const offsetAngle = togetherFromStart ? -angleBetweenDots / 2 : 0;
      const angle = startAngleInRadians + offsetAngle + i * angleBetweenDots + i * gapInRadians;

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      const fill = colors[i % colors.length];

      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={dotRadius}
          fill={fill}
          className={buildClassName(s.dot, animated && s.animated)}
          onClick={handleClick(i)}
          onDragEnter={handleDragEnter(i)}
        />
      );
    });
  };

  const translate = `translate(${radius + dotRadius}, ${radius + dotRadius})`;
  const size = 2 * (radius + dotRadius);

  return (
    <svg width={size} height={size}>
      <g transform={translate}>{dots()}</g>
    </svg>
  );
};

export default memo(CircleWithDots);
