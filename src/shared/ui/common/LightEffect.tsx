import React, { useEffect, useState, FC, memo, useLayoutEffect, useCallback, useMemo } from 'react';
import buildStyle from '@/shared/lib/buildStyle';
import { throttle } from '@/lib/utils/schedulers';
import s from './LightEffect.module.css';
import { IVector2 } from '@/lib/core/public/math/vector2';

interface LightEffectProps {
  gridRef: React.RefObject<HTMLElement | null>;
  lightSize: number;
  intencity?: number;
}

const DEFAULT_LIGHT_SIZE = 50; // px
const THROTTLE_DELAY = 50; // ms
const initialState = {
  x: -DEFAULT_LIGHT_SIZE * 50,
  y: -DEFAULT_LIGHT_SIZE * 50,
};

const LightEffect: FC<LightEffectProps> = ({ gridRef, lightSize }) => {
  const [position, setPosition] = useState<IVector2>(initialState);

  // Memoize grid dimensions to avoid unnecessary recalculations
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const handleResize = useCallback(() => {
    if (!gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    setGridDimensions({
      width: gridRect.width,
      height: gridRect.height,
      left: gridRect.left,
      top: gridRect.top,
    });
  }, [gridRef]);

  useEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const handleMouseMove = useMemo(
    () =>
      throttle((e: MouseEvent) => {
        if (!gridRef.current) return;
        const { width: maxX, height: maxY, left: startLeft, top: startTop } = gridDimensions;

        const halfLightSize = lightSize / 2;
        const cursorX = e.clientX - startLeft - halfLightSize;
        const cursorY = e.clientY - startTop - halfLightSize;

        const isOutOfBoundsX = cursorX < -lightSize || maxX < cursorX;
        const isOutOfBoundsY = cursorY < -lightSize || maxY < cursorY;

        if (!(isOutOfBoundsX || isOutOfBoundsY)) {
          setPosition(prev =>
            prev.x !== cursorX || prev.y !== cursorY ? { x: cursorX, y: cursorY } : prev,
          );
        }
      }, THROTTLE_DELAY),
    [gridDimensions, lightSize],
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div
      aria-label="Light effect indicating current position"
      aria-live="polite"
      className={s.lightEffect}
      data-light-size={lightSize}
      data-testid="light-effect"
      role="img"
      style={buildStyle(
        `--light-size: ${lightSize}px`,
        `--light-position-x: ${Math.round(position.x)}px`,
        `--light-position-y: ${Math.round(position.y)}px`,
      )}
    />
  );
};

export default memo(LightEffect);
