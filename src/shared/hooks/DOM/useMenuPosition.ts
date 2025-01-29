import { requestNextMutation } from "@/lib/modules/fastdom/fastdom";
import { useCallback, useLayoutEffect } from "react";
import { addExtraClass, setExtraStyles } from "../../lib/extraClassHelpers";
import { useStateRef } from "../base";

type IAnchorPosition = { x: number; y: number };

interface StaticPositionOptions {
  positionX?: "left" | "right";
  positionY?: "top" | "bottom";
  transformOriginX?: number;
  transformOriginY?: number;
  style?: string;
  heightStyle?: string;
}

interface DynamicPositionOptions {
  anchor: IAnchorPosition;
  getTriggerElement: () => HTMLElement | null;
  getRootElement: () => HTMLElement | null;
  getMenuElement: () => HTMLElement | null;
  getLayout?: () => Layout;
  withMaxHeight?: boolean;
}

export type MenuPositionOptions =
  | StaticPositionOptions
  | DynamicPositionOptions;

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

  const applyPositioning = useCallback(() => {
    const currentOptions = optionsRef.current;

    if (!("getTriggerElement" in currentOptions)) {
      applyStaticOptions(containerRef, bubbleRef, currentOptions);
    } else {
      requestNextMutation(() => {
        const staticOptions = processDynamically(currentOptions);

        return () => {
          if (staticOptions) {
            applyStaticOptions(containerRef, bubbleRef, staticOptions);
          }
        };
      });
    }
  }, [containerRef, bubbleRef, optionsRef]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    applyPositioning();
  }, [isOpen, anchor, applyPositioning]);
}

function getLayoutMeasurements(
  rootEl: HTMLElement | null,
  triggerEl: HTMLElement,
  menuEl: HTMLElement | null,
  menuElMinWidth: number,
): LayoutMeasurements {
  const rootRect = rootEl?.getBoundingClientRect() || EMPTY_RECT;

  return {
    root: rootRect,
    trigger: triggerEl.getBoundingClientRect(),
    menu: {
      width: menuEl ? Math.max(menuEl.offsetWidth, menuElMinWidth) : 0,
      height: menuEl?.offsetHeight || 0,
      marginTop: parseInt(
        getComputedStyle(menuEl as Element).marginTop || "0",
        10,
      ),
    },
    viewport: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
  };
}

function calculatePosition(
  anchor: IAnchorPosition,
  measurements: LayoutMeasurements,
  layout: Layout,
): PositionCalculation {
  const { menu, viewport } = measurements;
  const { isDense, extraPaddingX = 0 } = layout;

  // Horizontal positioning
  const canFitRight = anchor.x + menu.width + extraPaddingX < viewport.width;
  const positionX = isDense || canFitRight ? "left" : "right";
  let x = positionX === "left" ? anchor.x + 3 : anchor.x - menu.width - 3;

  // Vertical positioning
  const canFitBelow = anchor.y + menu.height < viewport.height;
  const positionY = isDense || canFitBelow ? "top" : "bottom";
  let y = positionY === "top" ? anchor.y : anchor.y - menu.height;

  return { positionX, positionY, x, y };
}

function applyPositionConstraints(
  position: PositionCalculation,
  measurements: LayoutMeasurements,
  layout: Layout,
): PositionCalculation {
  const { menu, viewport } = measurements;
  const { shouldAvoidNegativePosition } = layout;

  let { x, y } = position;

  console.log(menu.width);

  x = Math.max(
    MENU_POSITION_VISUAL_COMFORT_SPACE_PX,
    Math.min(
      x,
      viewport.width - menu.width - MENU_POSITION_VISUAL_COMFORT_SPACE_PX,
    ),
  );

  y = Math.max(
    MENU_POSITION_VISUAL_COMFORT_SPACE_PX, // Используем константу вместо root.top
    Math.min(y, viewport.height - menu.height - MENU_POSITION_BOTTOM_MARGIN),
  );

  if (shouldAvoidNegativePosition) {
    x = Math.max(x, 0);
    y = Math.max(y, 0);
  }

  return { ...position, x, y };
}

function calculateFinalPosition(
  position: PositionCalculation,
  measurements: LayoutMeasurements,
  layout: Layout,
) {
  const { trigger, menu } = measurements;
  const { deltaX = 0, topShiftY = 0, withPortal } = layout;

  const portalOffsetX = withPortal ? trigger.left : 0;
  const portalOffsetY = withPortal ? trigger.top : 0;

  const offsetX = position.x - trigger.left + portalOffsetX;
  const offsetY = position.y - trigger.top + portalOffsetY;

  return {
    left: position.x + deltaX - portalOffsetX,
    top: position.y + topShiftY - portalOffsetY,
    transformOriginX:
      position.positionX === "left" ? offsetX : menu.width - offsetX,
    transformOriginY:
      position.positionY === "top" ? offsetY : menu.height - offsetY,
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

  const triggerEl = getTriggerElement();
  const menuEl = getMenuElement();
  const rootEl = getRootElement();
  const layout = getLayout?.() || {};

  if (!triggerEl || !menuEl || !rootEl) return null;

  const measurements = getLayoutMeasurements(
    rootEl,
    triggerEl,
    menuEl,
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

  let maxHeightStyle = "";
  if (withMaxHeight) {
    const maxHeight =
      measurements.viewport.height -
      finalPosition.top -
      MENU_POSITION_BOTTOM_MARGIN;
    maxHeightStyle = `max-height: ${maxHeight}px;`;
  }

  return {
    positionX: constrainedPosition.positionX,
    positionY: constrainedPosition.positionY,
    style: `left: ${finalPosition.left}px; top: ${finalPosition.top}px;`,
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
    style,
    heightStyle,
    positionX,
    positionY,
    transformOriginX,
    transformOriginY,
  } = options;

  if (style) containerEl.style.cssText = style;
  if (heightStyle) bubbleEl.style.cssText = heightStyle;

  if (positionX) addExtraClass(bubbleEl, positionX);
  if (positionY) addExtraClass(bubbleEl, positionY);

  setExtraStyles(bubbleEl, {
    transformOrigin: [
      transformOriginX ? `${transformOriginX}px` : positionX,
      transformOriginY ? `${transformOriginY}px` : positionY,
    ].join(" "),
  });
}
