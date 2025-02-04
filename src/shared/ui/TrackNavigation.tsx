import { FC, useRef, memo, useInsertionEffect, useMemo } from "react";
import buildClassName from "../lib/buildClassName";
import s from "./TrackNavigation.module.scss";
import buildStyle from "../lib/buildStyle";
import { requestMutation } from "@/lib/modules/fastdom/fastdom";

type OwnProps = {
  count: number;
  visible?: number;
  index: number;
  size?: "small" | "medium" | "large";
  height?: number;
  width?: number;
};

// All the dimentions are in px
const MASK_HEIGHT = 20;
const MASK_WIDTH = 10;
const MASK_GAP = 2;
const BORDER_MASK_LEVEL = 4;

const TrackNavigation: FC<OwnProps> = ({
  count,
  index,
  visible = 4,
  size = "small",
  height = MASK_HEIGHT,
  width = MASK_WIDTH,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const markupParams = useMemo(
    () => calculateMarkup(count, index, visible, height, width),
    [count, index, visible, height, width],
  );

  const clipPathMarkup = useMemo(
    () => (
      <svg height="0" width="0" aria-hidden="true">
        <defs dangerouslySetInnerHTML={{ __html: markupParams.clipPath }} />
      </svg>
    ),
    [markupParams.clipPath],
  );

  const containerStyle = useMemo(
    () => ({
      height: `${height}px`,
    }),
    [height],
  );

  const trackWrapperStyle = useMemo(
    () => ({
      clipPath: `url("#${markupParams.clipPathId}")`,
      width: `${width}px`,
      height: `${markupParams.trackHeight}px`,
      transform: `translateY(-${markupParams.trackTranslateY}px)`,
    }),
    [width, markupParams],
  );

  const borderMarkStyle = useMemo(
    () => ({
      height: `${markupParams.markHeight}px`,
      transform: `translateY(${markupParams.markTranslateY}px)`,
    }),
    [markupParams],
  );

  useInsertionEffect(() => {
    const currentElement = containerRef.current;
    if (!currentElement) return;

    requestMutation(() => {
      currentElement.style.transform = `translateY(-${markupParams.trackTranslateY}px)`;
      currentElement.style.clipPath = `url("#${markupParams.clipPathId}")`;
    });
  }, [markupParams.trackTranslateY, markupParams.clipPathId]);

  if (count === 1) {
    return (
      <div className={buildClassName(s.trackNavigationBorder, s[size])}>
        <div ref={containerRef} className={s.trackNavigationBorderWrapper1} />
        {clipPathMarkup}
      </div>
    );
  }

  return (
    <div
      className={buildClassName(
        s.trackNavigationBorder,
        count > BORDER_MASK_LEVEL && s.trackNavigationBorderMask,
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
        <div className={s.trackNavigationBorderMark} style={borderMarkStyle} />
      </div>
    </div>
  );
};

function calculateMarkup(
  count: number,
  index: number,
  visible: number,
  height: number,
  width: number,
) {
  const reverseIndex = count - index - 1;
  const barHeight = getMaxHeight(count, visible, height);
  const markHeight = getMaxHeight(count, visible, height);
  const trackHeight = getTrackHeight(count, barHeight, height);

  const clipPathId = `clipPath${count}`;
  const clipPath = getClipPath(clipPathId, barHeight, count, width);

  const markTranslateY = getMarkTranslateY(reverseIndex, barHeight);
  const trackTranslateY = getTrackTranslateY(
    reverseIndex,
    count,
    visible,
    barHeight,
    trackHeight,
    height,
  );

  return {
    markHeight,
    clipPath,
    markTranslateY,
    trackTranslateY,
    trackHeight,
    clipPathId,
  };
}

function getMaxHeight(count: number, visible: number, height: number): number {
  if (count <= 0) {
    return height;
  }

  if (count <= visible) {
    return height / count - MASK_GAP;
  }

  return height / visible - MASK_GAP;
}

function getTrackHeight(count: number, barHeight: number, height: number) {
  if (count <= 3) {
    return height;
  }

  const includeAllGap = MASK_GAP * (count - 1);

  return barHeight * count + includeAllGap;
}

function getClipPath(
  id: string,
  barHeight: number,
  count: number,
  width: number,
) {
  const radius = 1;

  let d = "";

  for (let i = 0; i < count; i++) {
    const yPos = (barHeight + MASK_GAP) * i;

    d += drawRect(0, yPos, width, barHeight, radius);
  }

  return `<clipPath id="${id}"><path d="${d}" /></clipPath>`;
}

function drawRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  // Limit the radius to the smallest of the radius, half the width, or half the height.
  // This prevents the rounded corners from overlapping the width or height.
  const r = Math.min(radius, width / 2, height / 2);

  // Return the SVG path commands as a string:
  // M = "move to" the starting point (x + r, y), accounting for the rounded corner on the top-left
  // h = "horizontal line" drawing to the right by (width - 2 * r), leaving room for the rounded corner on the top-right
  // a = "arc" to draw the rounded corner (r, r) from the top-right corner
  // v = "vertical line" drawing downward by (height - 2 * r), leaving room for the rounded corner on the bottom-right
  // a = "arc" to draw the rounded corner (r, r) at the bottom-right corner
  // h = "horizontal line" drawing to the left by (width - 2 * r), leaving room for the rounded corner on the bottom-left
  // a = "arc" to draw the rounded corner (r, r) at the bottom-left corner
  // v = "vertical line" drawing upward by (height - 2 * r), leaving room for the rounded corner on the top-left
  // a = "arc" to draw the rounded corner (r, r) back to the starting point, closing the path
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

function getMarkTranslateY(index: number, barHeight: number): number {
  return (barHeight + MASK_GAP) * index;
}

function getTrackTranslateY(
  index: number,
  count: number,
  visible: number,
  barHeight: number,
  trackHeight: number,
  height: number,
): number {
  if (index <= 1) {
    return 0;
  }

  if (count - MASK_GAP <= index) {
    return trackHeight - height;
  }

  return (barHeight + visible) / 2 + (index - MASK_GAP) * (barHeight + 2);
}

export default memo(TrackNavigation);
