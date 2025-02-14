import { IS_IOS, throttle } from "../core";
import { requestNextMutation } from "../modules/fastdom/fastdom";

interface IDimensions {
  height: number;
  width: number;
}

const RESIZE_THROTTLE_MS = 150;
let rafId: number | null = null;

const visualViewport = typeof window !== "undefined" && window.visualViewport;
const isIOS = typeof window !== "undefined" && IS_IOS;

const dimensions: IDimensions = {
  height: typeof window !== "undefined" ? window.innerHeight : 0,
  width: typeof window !== "undefined" ? window.innerWidth : 0,
} as const;

let initialHeight = dimensions.height;

const updateCssVars = () => {
  const vh = dimensions.height * 0.01;

  return () => {
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
}

function getVisualViewportDimensions(): IDimensions {
  if (!visualViewport) return dimensions;

  return {
    width: Math.round(visualViewport.width),
    height: Math.round(visualViewport.height),
  };
}

function handleViewportChange() {
  if (rafId) cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    const newDimensions = isIOS
      ? getVisualViewportDimensions()
      : { width: window.innerWidth, height: window.innerHeight };

    if (
      newDimensions.width !== dimensions.width ||
      newDimensions.height !== dimensions.height
    ) {
      Object.assign(dimensions, newDimensions);
      requestNextMutation(updateCssVars);
    }
  });
}

function handleOrientationChange() {
  initialHeight = window.innerHeight;
  handleViewportChange();
}

const throttledResize = throttle(
  handleViewportChange,
  RESIZE_THROTTLE_MS,
  true,
);

export function initializeViewportListeners() {
  if (typeof window === "undefined") return;

  window.addEventListener("resize", throttledResize, { passive: true });
  window.addEventListener("orientationchange", handleOrientationChange, {
    passive: true,
  });

  if (visualViewport) {
    visualViewport.addEventListener("resize", throttledResize, {
      passive: true,
    });
  }

  requestNextMutation(updateCssVars);
}

// Initialize automatically in non-SSR environments
if (typeof window !== "undefined") {
  initializeViewportListeners();
}

export default {
  get dimensions() {
    return { ...dimensions };
  },
  get isKeyboardVisible() {
    return isIOS && initialHeight > dimensions.height;
  },
  update: handleViewportChange,
};
