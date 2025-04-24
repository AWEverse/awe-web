import { requestMutation, requestNextMutation } from "@/lib/modules/fastdom";
import { useLayoutEffect } from "react";
import {
  batchUpdate,
} from "../../../../shared/lib/extraClassHelpers";
import { useStateRef } from "../../../../shared/hooks/base";
import { clamp, IVector2 } from "@/lib/core";
import windowSize from "@/lib/utils/windowSize";


interface Layout {
  extraPaddingX?: number;
  extraTopPadding?: number;
  extraMarginTop?: number;
  menuElMinWidth?: number;
  deltaX?: number;
  topShiftY?: number;
  shouldAvoidNegativePosition?: boolean;
  withPortal?: boolean;
  isDense?: boolean;
}

interface StaticPositionOptions {
  positionX?: "left" | "right" | string;
  positionY?: "top" | "bottom" | string;
  transformOriginX?: number;
  transformOriginY?: number;
  style?: string;
  heightStyle?: string;
}

interface DynamicPositionOptions {
  anchor: IVector2;
  getTriggerElement: () => HTMLElement | null;
  getRootElement: () => HTMLElement | null;
  getMenuElement: () => HTMLElement | null;
  getLayout?: () => Layout;
  withMaxHeight?: boolean;
}

export type MenuPositionOptions =
  | StaticPositionOptions
  | DynamicPositionOptions;

interface LayoutMeasurements {
  root: DOMRect | { width: number; height: number; top: number; left: number };
  trigger: DOMRect;
  menu: { width: number; height: number; marginTop: number };
  viewport: { width: number; height: number };
}

interface PositionCalculation {
  positionX: "left" | "right";
  positionY: "top" | "bottom";
  x: number;
  y: number;
}

const MENU_POSITION_VISUAL_COMFORT_SPACE_PX = 16;
const MENU_POSITION_BOTTOM_MARGIN = 12;
const EMPTY_RECT = { width: 0, left: 0, height: 0, top: 0 };

export default function useMenuPosition(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
  bubbleRef: React.RefObject<HTMLDivElement | null>,
  options: MenuPositionOptions,
) {
  const { anchor } = options as DynamicPositionOptions;
  const optionsRef = useStateRef(options);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const currentOptions = optionsRef.current;

    if (!("getTriggerElement" in currentOptions)) {
      requestMutation(() => {
        applyStaticOptions(
          containerRef,
          bubbleRef,
          currentOptions as StaticPositionOptions,
        );
      })
    }
    else {
      requestNextMutation(() => {
        const dynamicStyles = processDynamically(
          currentOptions as DynamicPositionOptions,
        );

        return () => {
          console.log(dynamicStyles);
          if (dynamicStyles) {
            applyStaticOptions(containerRef, bubbleRef, dynamicStyles);
          }
        };
      });
    }
  }, [isOpen, anchor]);
}

function getLayoutMeasurements(
  rootEl: HTMLElement | null,
  triggerEl: HTMLElement,
  menuEl: HTMLElement | null,
  menuElMinWidth: number,
): LayoutMeasurements {
  const { width, height } = windowSize.dimensions;

  const rootRect = rootEl?.getBoundingClientRect() ?? EMPTY_RECT;
  const triggerRect = triggerEl.getBoundingClientRect();

  let menuWidth = 0;
  let menuHeight = 0;
  let menuMarginTop = 0;

  if (menuEl) {
    menuWidth = Math.max(menuEl.offsetWidth, menuElMinWidth);
    menuHeight = menuEl.offsetHeight;
    menuMarginTop =
      parseFloat(getComputedStyle(menuEl as Element).marginTop) || 0;
  }

  return {
    root: rootRect,
    trigger: triggerRect,
    menu: {
      width: menuWidth,
      height: menuHeight,
      marginTop: menuMarginTop,
    },
    viewport: {
      width: width,
      height: height,
    },
  };
}

function calculatePosition(
  anchor: IVector2,
  measurements: LayoutMeasurements,
  layout: Layout
): PositionCalculation {
  const { menu, viewport } = measurements;
  const { isDense, extraPaddingX = 0 } = layout;
  const OFFSET = 3; // Consistent offset for adjustments

  // Determine horizontal placement:
  // If the layout is dense or the menu fits on the right side within the viewport,
  // position the menu to the left of the anchor; otherwise, position it to the right.
  const canFitRight = anchor.x + menu.width + extraPaddingX < viewport.width;
  const positionX: "left" | "right" = isDense || canFitRight ? "left" : "right";
  const x = positionX === "left" ? anchor.x + OFFSET : anchor.x - menu.width - OFFSET;

  // Determine vertical placement:
  // If the layout is dense or the menu fits below the anchor within the viewport,
  // position the menu at the top of the anchor; otherwise, position it above.
  const canFitBelow = anchor.y + menu.height < viewport.height;
  const positionY: "top" | "bottom" = isDense || canFitBelow ? "top" : "bottom";
  const y = positionY === "top" ? anchor.y : anchor.y - menu.height;

  return { positionX, positionY, x, y };
}

function applyPositionConstraints(
  { x, y, ...rest }: PositionCalculation,
  { menu, viewport }: LayoutMeasurements,
  { shouldAvoidNegativePosition }: Layout,
): PositionCalculation {
  const minX = MENU_POSITION_VISUAL_COMFORT_SPACE_PX;
  const maxX = viewport.width - menu.width - MENU_POSITION_VISUAL_COMFORT_SPACE_PX;

  const minY = MENU_POSITION_VISUAL_COMFORT_SPACE_PX;
  const maxY = viewport.height - menu.height - MENU_POSITION_BOTTOM_MARGIN;

  x = clamp(x, minX, maxX);
  y = clamp(y, minY, maxY);

  if (shouldAvoidNegativePosition) {
    x = Math.max(x, 0);
    y = Math.max(y, 0);
  }

  return { ...rest, x, y };
}

function calculateFinalPosition(
  initialPosition: PositionCalculation,
  measurements: LayoutMeasurements,
  layout: Layout,
) {
  const { trigger, menu } = measurements;
  const { deltaX = 0, topShiftY = 0, withPortal } = layout;

  const portalXOffset = withPortal ? trigger.left : 0;
  const portalYOffset = withPortal ? trigger.top : 0;

  const relativeX = initialPosition.x - trigger.left + portalXOffset;
  const relativeY = initialPosition.y - trigger.top + portalYOffset;

  const finalLeft = initialPosition.x + deltaX - portalXOffset;
  const finalTop = initialPosition.y + topShiftY - portalYOffset;

  const transformOriginX =
    initialPosition.positionX === "left" ? relativeX : menu.width - relativeX;
  const transformOriginY =
    initialPosition.positionY === "top" ? relativeY : menu.height - relativeY;

  return {
    left: finalLeft,
    top: finalTop,
    transformOriginX,
    transformOriginY,
  };
}


function processDynamically(options: DynamicPositionOptions) {
  const {
    anchor,
    getRootElement,
    getMenuElement,
    getTriggerElement,
    getLayout,
    withMaxHeight,
  } = options;

  const triggerElement = getTriggerElement();
  const menuElement = getMenuElement();
  const rootElement = getRootElement();

  const layout = getLayout?.() || {};

  if (!triggerElement || !menuElement || !rootElement) {
    return null;
  }

  const measurements = getLayoutMeasurements(
    rootElement,
    triggerElement,
    menuElement,
    layout.menuElMinWidth || 0,
  );

  const basePosition = calculatePosition(anchor, measurements, layout);

  const constrainedPosition = applyPositionConstraints(
    basePosition,
    measurements,
    layout,
  );

  const finalPosition = calculateFinalPosition(
    constrainedPosition,
    measurements,
    layout,
  );

  const maxHeightStyle = withMaxHeight
    ? `max-height: ${measurements.viewport.height - finalPosition.top - MENU_POSITION_BOTTOM_MARGIN}px;`
    : "";

  const positionStyles = `left: ${finalPosition.left}px; top: ${finalPosition.top}px;`;

  return {
    positionX: constrainedPosition.positionX,
    positionY: constrainedPosition.positionY,
    style: positionStyles,
    heightStyle: maxHeightStyle,
    transformOriginX: finalPosition.transformOriginX,
    transformOriginY: finalPosition.transformOriginY,
  };
}


function applyStaticOptions(
  containerRef: React.RefObject<HTMLDivElement | null>,
  bubbleRef: React.RefObject<HTMLDivElement | null>,
  options: StaticPositionOptions,
) {
  const containerEl = containerRef.current;
  const bubbleEl = bubbleRef.current;

  if (!containerEl || !bubbleEl) return;

  const {
    style = "",
    heightStyle = "",
    positionX = "",
    positionY = "",
    transformOriginX,
    transformOriginY,
  } = options;

  containerEl.style.cssText = `${style} transform-origin: ${positionX} ${positionY}`;

  batchUpdate(bubbleEl, {
    styles: {
      transformOrigin: [
        transformOriginX != null ? `${transformOriginX}px` : positionX,
        transformOriginY != null ? `${transformOriginY}px` : positionY,
      ].join(" "),
    },
    classesToAdd: heightStyle ? [positionX, positionY] : undefined,
  });
}
