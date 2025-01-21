import { FC, useRef, useLayoutEffect, memo, useInsertionEffect } from "react";
import buildClassName from "../lib/buildClassName";
import s from "./TrackNavigation.module.scss";
import buildStyle from "../lib/buildStyle";
import {
  requestForcedReflow,
  requestMeasure,
} from "@/lib/modules/fastdom/fastdom";

type OwnProps = {
  count: number;
  visible?: number;
  index: number;
  size?: "small" | "medium" | "large";
};

// All the dimentions are in px
const MASK_HEIGHT = 50;
const MASK_WIDTH = 2.5;
const MASK_GAP = 2;
const BORDER_MASK_LEVEL = 4;

const TrackNavigation: FC<OwnProps> = ({
  count,
  index,
  visible = 4,
  size = "small",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const markupParams = calculateMarkup(count, index, visible);

  useInsertionEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const {
      trackHeight,
      trackTranslateY,
      markHeight,
      markTranslateY,
      clipPathId,
      clipPath,
    } = markupParams;

    const currentElement = containerRef.current;
    const firstChild = currentElement?.firstElementChild;

    const svg = currentElement?.querySelector("svg");
    const div = currentElement?.querySelector("div");
    const defs = currentElement?.querySelector("defs");

    // Perform synchronous DOM manipulations
    currentElement.style.height = `${trackHeight}px`;
    currentElement.style.transform = `translateY(-${trackTranslateY}px)`;
    currentElement.style.clipPath = `url("#${clipPathId}")`;

    if (!svg && firstChild) {
      firstChild.innerHTML = `<svg height="0" width="0"><defs> ${clipPath} </defs></svg>`;
    }

    if (defs) {
      defs.innerHTML = clipPath;
    }

    if (div) {
      div.style.height = `${markHeight}px`;
      div.style.transform = `translateY(${markTranslateY}px)`;
    }
  }, [markupParams]);

  if (count === 1) {
    return (
      <div className={buildClassName(s.trackNavigationBorder, s[size])}>
        <div ref={containerRef} className={s.trackNavigationBorderWrapper1} />
      </div>
    );
  }

  const {
    trackHeight,
    trackTranslateY,
    markHeight,
    markTranslateY,
    clipPathId,
  } = markupParams;

  const isBorderMaskInRange = count > BORDER_MASK_LEVEL;

  return (
    <div
      className={buildClassName(
        s.trackNavigationBorder,
        isBorderMaskInRange && s.trackNavigationBorderMask,
        s[size],
      )}
      style={buildStyle(`height: ${MASK_HEIGHT}px`)}
    >
      <div
        ref={containerRef}
        className={s.trackNavigationBorderWrapper}
        style={buildStyle(
          `clipPath: url("#${clipPathId}"); width: ${MASK_WIDTH}px; height: ${trackHeight}px; transform: translateY(-${trackTranslateY}px);`,
        )}
      >
        <span />
        <div
          className={s.trackNavigationBorderMark}
          style={buildStyle(
            `--height: ${markHeight}px; --translate-y: ${markTranslateY}px; ` +
              `--translate-track: ${trackTranslateY}px;`,
          )}
        />
      </div>
    </div>
  );
};

function calculateMarkup(count: number, index: number, visible: number) {
  const reverseIndex = count - index - 1;
  const barHeight = getMaxHeight(count, visible);
  const markHeight = getMaxHeight(count, visible);
  const trackHeight = getTrackHeight(count, barHeight);

  const clipPathId = `clipPath${count}`;
  const clipPath = getClipPath(clipPathId, barHeight, count);

  const markTranslateY = getMarkTranslateY(reverseIndex, barHeight);
  const trackTranslateY = getTrackTranslateY(
    reverseIndex,
    count,
    visible,
    barHeight,
    trackHeight,
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

function getMaxHeight(count: number, visible: number): number {
  if (count <= 0) {
    return MASK_HEIGHT;
  }

  if (count <= visible) {
    return MASK_HEIGHT / count - MASK_GAP;
  }

  return MASK_HEIGHT / visible - MASK_GAP;
}

function getTrackHeight(count: number, barHeight: number) {
  if (count <= 3) {
    return MASK_HEIGHT;
  }

  const includeAllGap = MASK_GAP * (count - 1);

  return barHeight * count + includeAllGap;
}

function getClipPath(id: string, barHeight: number, count: number) {
  const radius = 1;

  let d = "";

  for (let i = 0; i < count; i++) {
    const yPos = (barHeight + MASK_GAP) * i;

    d += drawRect(0, yPos, MASK_WIDTH, barHeight, radius);
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
  return `M${x},${y + radius}a${radius},${radius},0,0,1,${width},0v${height - MASK_GAP * radius}a${radius},${radius},0,0,1,${-width},0Z`;
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
): number {
  if (index <= 1) {
    return 0;
  }

  if (count - MASK_GAP <= index) {
    return trackHeight - MASK_HEIGHT;
  }

  return (barHeight + visible) / 2 + (index - MASK_GAP) * (barHeight + 2);
}

export default memo(TrackNavigation);
