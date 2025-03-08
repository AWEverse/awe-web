import { createOrientation } from "./createOrientation";

function detectScreenOrientation() {
  if (typeof window === 'undefined') return undefined;

  const screen = window.screen;
  let orientation: ScreenOrientation | { type: string } | undefined;

  // W3C spec implementation
  if (
    screen?.orientation &&
    typeof screen.orientation.type === 'string'
  ) {
    orientation = screen.orientation;
  }
  // Legacy or non-standard browser fallback (using window.orientation)
  else if (typeof window.orientation === 'number') {
    orientation = {
      type: Math.abs(window.orientation) === 90 ? 'landscape-primary' : 'portrait-primary',
    };
  }
  // Fallback to custom created orientation
  else {
    orientation = createOrientation();
  }

  return orientation;
}

export default detectScreenOrientation;
