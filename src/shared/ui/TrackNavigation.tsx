import React, { FC, useRef, memo, useMemo, useLayoutEffect } from "react";
import buildClassName from "../lib/buildClassName"; // Utility to combine class names
import s from "./TrackNavigation.module.scss"; // SCSS module for styles
import { requestMutation } from "@/lib/modules/fastdom"; // FastDOM for efficient DOM updates

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
  const GAP = 2; // Gap between segments in pixels
  const CORNER_RADIUS = 1; // Radius for rounded corners in pixels

  // Handle invalid inputs
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
  if (count <= 0) return containerHeight;

  const effectiveCount = Math.min(count, visible);
  const totalGapHeight = gap * (effectiveCount - 1);
  const availableHeight = containerHeight - totalGapHeight;

  return Math.max(1, availableHeight / effectiveCount);
}

/**
 * Calculate the total height of the track.
 */
function calculateTrackHeight(
  count: number,
  segmentHeight: number,
  gap: number,
): number {
  if (count <= 0) return 0;

  return segmentHeight * count + gap * (count - 1);
}

/**
 * Generate an SVG clip path with rounded rectangles for each segment.
 */
function generateClipPath(
  id: string,
  count: number,
  segmentHeight: number,
  width: number,
  gap: number,
  radius: number,
): string {
  const pathCommands = [];
  for (let i = 0; i < count; i++) {
    const yPos = (segmentHeight + gap) * i;
    pathCommands.push(drawRoundedRect(0, yPos, width, segmentHeight, radius));
  }
  return `<clipPath id="${id}"><path d="${pathCommands.join(" ")}" /></clipPath>`;
}

/**
 * Draw a rounded rectangle path for the clip path.
 */
function drawRoundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  const r = Math.min(radius, width / 2, height / 2);
  return `M${x + r},${y}
          h${width - 2 * r}
          a${r},${r},0,0,1,${r},${r}
          v${height - 2 * r}
          a${r},${r},0,0,1,${-r},${r}
          h${-(width - 2 * r)}
          a${r},${r},0,0,1,${-r},${-r}
          v${-(height - 2 * r)}
          a${r},${r},0,0,1,${r},${-r}Z`;
}

/**
 * Calculate the Y translation for the highlight mark.
 */
function calculateMarkTranslateY(
  count: number,
  index: number,
  segmentHeight: number,
  gap: number,
): number {
  const safeIndex = Math.max(0, Math.min(count - 1, index));
  return (segmentHeight + gap) * safeIndex;
}

/**
 * Calculate the Y translation for the track to center the current segment.
 */
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

  const currentPosition = (segmentHeight + gap) * index;
  const viewportCenter = containerHeight / 2;
  const segmentCenter = currentPosition + segmentHeight / 2;
  let offset = segmentCenter - viewportCenter;
  const maxOffset = trackHeight - containerHeight;
  offset = Math.max(0, Math.min(maxOffset, offset));

  return offset;
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

    useLayoutEffect(() => {
      const currentElement = containerRef.current;
      if (!currentElement) return;
      requestMutation(() => {
        currentElement.style.transform = `translateY(-${layoutParams.trackTranslateY}px)`;
        currentElement.style.clipPath = `url("#${layoutParams.clipPathId}")`;
      });
    }, [layoutParams.trackTranslateY, layoutParams.clipPathId]);

    if (count <= 0 || visible <= 0 || height <= 0) return null;

    if (count === 1) {
      return (
        <div className={buildClassName(s.trackNavigationBorder, s[size])}>
          <div
            ref={containerRef}
            className={s.trackNavigationBorderWrapper1}
            style={{ height: `${height}px`, borderRadius: "1px" }}
          />
        </div>
      );
    }

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
