import { IS_FIREFOX } from "../platform";

export const ARE_CALLS_SUPPORTED = !IS_FIREFOX;

const hasScreen = typeof screen !== "undefined";

const hasOrientation = hasScreen && "orientation" in screen;

export const ORIENTATION_LOCK_SUPPORTED =
  hasOrientation &&
  "lock" in screen.orientation &&
  typeof screen.orientation.lock === "function";

export const ORIENTATION_UNLOCK_SUPPORTED =
  hasOrientation &&
  "unlock" in screen.orientation &&
  typeof screen.orientation.unlock === "function";
