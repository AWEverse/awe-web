import { throttle, IS_IOS } from "../core";
import {
  requestForcedReflow,
  requestMeasure,
} from "../modules/fastdom/fastdom";

interface IDimensions {
  height: number;
  width: number;
}

const WINDOW_ORIENTATION_CHANGE_THROTTLE_MS = 100;
const WINDOW_RESIZE_THROTTLE_MS = 250;

let initialHeight = window.innerHeight;
let currentWindowSize = updateSizes();

const handleResize = throttle(
  () => {
    currentWindowSize = updateSizes();
  },
  WINDOW_RESIZE_THROTTLE_MS,
  true,
);

const handleOrientationChange = throttle(
  () => {
    initialHeight = window.innerHeight;
    handleResize();
  },
  WINDOW_ORIENTATION_CHANGE_THROTTLE_MS,
  false,
);

window.addEventListener("orientationchange", handleOrientationChange);

if (IS_IOS) {
  window.visualViewport!.addEventListener("resize", handleResize);
} else {
  window.addEventListener("resize", handleResize);
}

export function updateSizes(): IDimensions {
  let height: number;

  requestForcedReflow(() => {
    if (IS_IOS && window.visualViewport) {
      height = window.visualViewport.height + window.visualViewport.pageTop;
    } else {
      height = window.innerHeight;
    }

    return () => {
      document.documentElement.style.setProperty("--vh", `${height * 0.01}px`);
    };
  });

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export default {
  get: () => currentWindowSize,
  getIsKeyboardVisible: () => initialHeight > currentWindowSize.height,
};
