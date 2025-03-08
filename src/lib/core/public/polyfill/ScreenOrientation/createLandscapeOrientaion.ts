import createMatchMediaPolyfill, { MATCH_MEDIA_SUPPORTED } from "../window/matchMediaPolyfill";

export default function createLandscapeOrientaion(): MediaQueryList {
  if (!MATCH_MEDIA_SUPPORTED) {
    createMatchMediaPolyfill();
  }

  return window.matchMedia('(orientation: landscape)');
}
