import { IS_IOS, round, throttle } from "../core";
import { requestNextMutation } from "../modules/fastdom";

interface IDimensions {
  height: number;
  width: number;
}

const RESIZE_THROTTLE_MS = 150;
const dimensions: IDimensions = {
  height: 0,
  width: 0,
};
let initialHeight = 0;
let rafId: number | null = null;

const isClient = typeof window !== "undefined";
const visualViewport = isClient ? window.visualViewport : null;
const isIOS = isClient && IS_IOS;

if (isClient) {
  dimensions.height = window.innerHeight;
  dimensions.width = window.innerWidth;
  initialHeight = window.innerHeight;
}

const updateCssVars = () => {
  const vh = round(dimensions.height * 0.01, 2);
  return () => {
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
};

const getVisualViewportDimensions = (): IDimensions => {
  if (!visualViewport) return { height: window.innerHeight, width: window.innerWidth };
  return {
    width: Math.round(visualViewport.width),
    height: Math.round(visualViewport.height),
  };
};

const handleViewportChange = () => {
  if (rafId) cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    const newDimensions = isIOS ? getVisualViewportDimensions() : {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (newDimensions.width === dimensions.width && newDimensions.height === dimensions.height) return;

    dimensions.width = newDimensions.width;
    dimensions.height = newDimensions.height;
    requestNextMutation(updateCssVars);
  });
};

const handleOrientationChange = () => {
  initialHeight = window.innerHeight;
  handleViewportChange();
};

const throttledResize = throttle(handleViewportChange, RESIZE_THROTTLE_MS, true);

const initializeViewportListeners = () => {
  if (!isClient) return;

  // Remove existing listeners to prevent duplicates
  window.removeEventListener("resize", throttledResize);
  window.removeEventListener("orientationchange", handleOrientationChange);
  if (visualViewport) visualViewport.removeEventListener("resize", throttledResize);

  // Add listeners with passive flag for performance
  window.addEventListener("resize", throttledResize, { passive: true });
  window.addEventListener("orientationchange", handleOrientationChange, { passive: true });
  if (visualViewport) {
    visualViewport.addEventListener("resize", throttledResize, { passive: true });
  }

  requestNextMutation(updateCssVars);
};

if (isClient) initializeViewportListeners();

export default {
  get dimensions() {
    return { width: dimensions.width, height: dimensions.height };
  },
  get isKeyboardVisible() {
    return isIOS && initialHeight > dimensions.height;
  },
  update: handleViewportChange,
  initialize: initializeViewportListeners,
};
