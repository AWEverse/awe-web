import { FC, useRef, memo, useMemo } from "react";
import buildClassName from "../lib/buildClassName"; // Utility to combine class names
import s from "./TrackNavigation.module.scss"; // SCSS module for styles

// Define prop types
type OwnProps = {
  count: number; // Total number of segments
  visible?: number; // Number of segments visible at once (default: 4)
  index: number; // Current active segment index
  size?: "small" | "medium" | "large"; // Size variant (default: "small")
  height?: number; // Container height in pixels (default: 20)
  width?: number; // Container width in pixels (default: 10)
};

/**
 * Calculate all layout parameters for the track navigation.
 */
function calculateLayoutParameters(
  count: number,
  index: number,
  visible: number,
  height: number,
  width: number,
) {
  const GAP = 3; // Gap between segments in pixels
  const CORNER_RADIUS = 1; // Radius for rounded corners in pixels

  if (count <= 0 || visible <= 0 || height <= 0) {
    return {
      segmentHeight: 0,
      trackHeight: 0,
      clipPathId: "",
      clipPath: "",
      markTranslateY: 0,
      trackTranslateY: 0,
    };
  }

  const segmentHeight = calculateSegmentHeight(count, visible, height, GAP);
  const trackHeight = calculateTrackHeight(count, segmentHeight, GAP);
  const clipPathId = `track-clip-path-${count}-${visible}-${width}-${height}`;
  const clipPath = generateClipPath(
    clipPathId,
    count,
    segmentHeight,
    width,
    GAP,
    CORNER_RADIUS,
  );
  const markTranslateY = calculateMarkTranslateY(
    count,
    index,
    segmentHeight,
    GAP,
  );
  const trackTranslateY = calculateTrackTranslateY(
    count,
    index,
    visible,
    segmentHeight,
    trackHeight,
    height,
    GAP,
  );

  return {
    segmentHeight,
    trackHeight,
    clipPathId,
    clipPath,
    markTranslateY,
    trackTranslateY,
  };
}

/**
 * Calculate the height of each segment.
 */
function calculateSegmentHeight(
  count: number,
  visible: number,
  containerHeight: number,
  gap: number,
): number {
  const effectiveCount = Math.max(1, Math.min(count, visible));
  const totalGapHeight = (effectiveCount - 1) * gap;
  const availableHeight = containerHeight - totalGapHeight;
  // Не округляем здесь, чтобы не накапливалась ошибка
  return Math.max(1, availableHeight / effectiveCount);
}

function calculateTrackHeight(
  count: number,
  segmentHeight: number,
  gap: number,
): number {
  if (count <= 0) return 0;
  return Math.ceil(segmentHeight * count + gap * (count - 1));
}

function calculateMarkTranslateY(
  count: number,
  index: number,
  segmentHeight: number,
  gap: number,
): number {
  const safeIndex = Math.max(0, Math.min(count - 1, index));
  return Math.round(safeIndex * (segmentHeight + gap));
}

function calculateTrackTranslateY(
  count: number,
  index: number,
  visible: number,
  segmentHeight: number,
  trackHeight: number,
  containerHeight: number,
  gap: number,
): number {
  if (count <= visible) return 0;
  const halfVisible = Math.floor(visible / 2);
  const maxOffset = Math.max(0, trackHeight - containerHeight);
  if (index < halfVisible) return 0;
  if (index > count - Math.ceil(visible / 2)) return maxOffset;
  const currentPosition = (segmentHeight + gap) * index;
  const viewportCenter = containerHeight / 2;
  const segmentCenter = currentPosition + segmentHeight / 2;
  let offset = Math.round(segmentCenter - viewportCenter);
  offset = Math.max(0, Math.min(maxOffset, offset));
  return offset;
}

function generateClipPath(
  id: string,
  count: number,
  segmentHeight: number,
  width: number,
  gap: number,
  radius: number,
): string {
  let rects = "";
  for (let i = 0; i < count; i++) {
    // Позиция рассчитывается без округления, а итоговая координата округляется
    const yPos = Math.round(i * (segmentHeight + gap));
    rects += `<rect x="0" y="${yPos}" width="${width}" height="${Math.round(segmentHeight)}" rx="${radius}" ry="${radius}" />`;
  }
  return `<clipPath id="${id}">${rects}</clipPath>`;
}

/**
 * TrackNavigation component.
 */
const TrackNavigation: FC<OwnProps> = memo(
  ({ count, index, visible = 4, size = "small", height = 20, width = 10 }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const layoutParams = useMemo(() => {
      return calculateLayoutParameters(count, index, visible, height, width);
    }, [count, index, visible, height, width]);

    const clipPathMarkup = useMemo(
      () => (
        <svg height="0" width="0" aria-hidden="true">
          <defs dangerouslySetInnerHTML={{ __html: layoutParams.clipPath }} />
        </svg>
      ),
      [layoutParams.clipPath],
    );

    const containerStyle = useMemo(() => ({ height: `${height}px` }), [height]);
    const trackWrapperStyle = useMemo(
      () => ({
        clipPath: `url("#${layoutParams.clipPathId}")`,
        width: `${width}px`,
        height: `${layoutParams.trackHeight}px`,
        transform: `translateY(-${layoutParams.trackTranslateY}px)`,
      }),
      [width, layoutParams],
    );
    const borderMarkStyle = useMemo(
      () => ({
        height: `${layoutParams.segmentHeight}px`,
        transform: `translateY(${layoutParams.markTranslateY}px)`,
      }),
      [layoutParams],
    );

    return (
      <div
        className={buildClassName(
          s.trackNavigationBorder,
          count > 4 && s.trackNavigationBorderMask,
          s[size],
        )}
        style={containerStyle}
      >
        <div
          ref={containerRef}
          className={s.trackNavigationBorderWrapper}
          style={trackWrapperStyle}
        >
          {clipPathMarkup}
          <div
            className={s.trackNavigationBorderMark}
            style={borderMarkStyle}
          />
        </div>
      </div>
    );
  },
);

export default TrackNavigation;
