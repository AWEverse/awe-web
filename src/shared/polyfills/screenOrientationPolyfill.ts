import { useEffect, useRef, useState } from "react";

export type OrientationType =
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary"
  | "unknown";

export interface ScreenOrientationPolyfillOptions {
  onChange?: (orientation: OrientationType) => void;
  lockType?: OrientationType | "any";
  fallback?: boolean; // fallback to resize/orientationchange events
}

export function getOrientationType(): OrientationType {
  if (window.screen.orientation && window.screen.orientation.type) {
    return window.screen.orientation.type as OrientationType;
  }
  // Fallback for older browsers
  const angle = window.orientation;
  if (typeof angle === "number") {
    if (angle === 0) return "portrait-primary";
    if (angle === 180) return "portrait-secondary";
    if (angle === 90) return "landscape-primary";
    if (angle === -90) return "landscape-secondary";
  }
  // Heuristic fallback
  if (window.innerWidth > window.innerHeight) return "landscape-primary";
  if (window.innerHeight > window.innerWidth) return "portrait-primary";
  return "unknown";
}

export function lockOrientation(type: OrientationType | "any" = "any"): Promise<void> {
  if (window.screen.orientation && (window.screen.orientation as any).lock) {
    return (window.screen.orientation as any).lock(type === "any" ? undefined : type);
  }
  // Not supported
  return Promise.reject(new Error("Screen Orientation API not supported"));
}

export function unlockOrientation(): void {
  if (window.screen.orientation && window.screen.orientation.unlock) {
    window.screen.orientation.unlock();
  }
}

export function useScreenOrientationPolyfill(options: ScreenOrientationPolyfillOptions = {}) {
  const { onChange, lockType, fallback = true } = options;
  const [orientation, setOrientation] = useState<OrientationType>(getOrientationType());
  const lastOrientation = useRef(orientation);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const handleChange = () => {
      const newOrientation = getOrientationType();
      setOrientation(newOrientation);
      if (lastOrientation.current !== newOrientation) {
        lastOrientation.current = newOrientation;
        onChange?.(newOrientation);
      }
    };
    if (window.screen.orientation && "onchange" in window.screen.orientation) {
      window.screen.orientation.addEventListener("change", handleChange);
      cleanup = () => window.screen.orientation.removeEventListener("change", handleChange);
    } else if (fallback) {
      window.addEventListener("orientationchange", handleChange);
      window.addEventListener("resize", handleChange);
      cleanup = () => {
        window.removeEventListener("orientationchange", handleChange);
        window.removeEventListener("resize", handleChange);
      };
    }
    // Initial call
    handleChange();
    return cleanup;
  }, [onChange, fallback]);

  useEffect(() => {
    if (lockType) {
      lockOrientation(lockType).catch(() => { });
      return unlockOrientation;
    }
  }, [lockType]);

  return {
    orientation,
    lock: lockOrientation,
    unlock: unlockOrientation,
    isPortrait: orientation.startsWith("portrait"),
    isLandscape: orientation.startsWith("landscape"),
  };
}
