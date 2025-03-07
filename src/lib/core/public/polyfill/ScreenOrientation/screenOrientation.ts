import { IS_BROWSER } from "../../os";
import { ORIENTATION_LOCK_SUPPORTED, ORIENTATION_UNLOCK_SUPPORTED } from "../../os/support/browser";

type OrientationType = "portrait-primary" | "landscape-primary" | "portrait-secondary" | "landscape-secondary";

type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

interface PartialDocumentSupport extends Document {
  webkitFullscreenElement?: Element | null;
}

// Extend the ScreenOrientation interface for our polyfill.
interface ScreenOrientationPolyfill extends Omit<ScreenOrientation, "type" | "lock" | "unlock"> {
  type: OrientationType;
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
  addEventListener(
    type: "change",
    listener: (this: ScreenOrientationPolyfill, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: "change",
    listener: (this: ScreenOrientationPolyfill, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
}

const createScreenOrientationPolyfill = (): ScreenOrientationPolyfill => {
  let lockedOrientation: OrientationLockType | null = null;
  let isFullscreen = false;
  const listeners = new Set<EventListener>();

  // Map each native orientation type to its corresponding angle.
  const angleMap: Record<OrientationType, number> = {
    "portrait-primary": 0,
    "landscape-primary": 90,
    "portrait-secondary": 180,
    "landscape-secondary": -90,
  };

  // Determine the current orientation from the native API, window.orientation, or media query.
  const getNativeOrientation = (): OrientationType => {
    if (screen.orientation?.type) return screen.orientation.type as OrientationType;

    const angle =
      (typeof window.orientation === "number" ? window.orientation : undefined) ||
      ((screen.orientation as any)?.angle !== undefined ? (screen.orientation as any).angle : undefined) ||
      (matchMedia("(orientation: portrait)").matches ? 0 : 90);

    switch (Math.abs(Number(angle))) {
      case 90:
        return "landscape-primary";
      case 180:
        return "portrait-secondary";
      default:
        return "portrait-primary";
    }
  };

  // Dispatch a synthetic 'change' event.
  const updateOrientation = (): void => {
    const event = new Event("change");
    listeners.forEach((listener) => listener(event));
    if (polyfill.onchange) polyfill.onchange(event);
  };

  // Apply CSS rotation to the target element (fullscreen element or the document root).
  const applyVisualRotation = (degrees?: number): void => {
    const targetElement = (document.fullscreenElement || document.documentElement) as HTMLElement;
    if (degrees !== undefined) {
      targetElement.style.transform = `rotate(${degrees}deg)`;
      targetElement.style.transformOrigin = "center center";
      targetElement.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    } else {
      targetElement.style.transform = "";
      targetElement.style.transition = "";
    }
  };

  // Calculate the rotation needed based on the current native orientation and the desired locked orientation.
  const getRotation = (): number => {
    if (!lockedOrientation) return 0;
    const currentType = getNativeOrientation();
    const currentAngle = angleMap[currentType];

    switch (lockedOrientation) {
      case "landscape": {
        if (currentType.startsWith("portrait")) {
          const targetAngle = angleMap["landscape-primary"];
          return targetAngle - currentAngle;
        }
        return 0;
      }
      case "portrait": {
        if (currentType.startsWith("landscape")) {
          const targetAngle = angleMap["portrait-primary"];
          return targetAngle - currentAngle;
        }
        return 0;
      }
      default: {
        const targetAngle = angleMap[lockedOrientation as OrientationType];
        return targetAngle - currentAngle;
      }
    }
  };

  // Apply the calculated rotation visually.
  const applyRotation = (): void => {
    const rotation = getRotation();
    applyVisualRotation(rotation);
  };

  // Our polyfill object implements the ScreenOrientationPolyfill interface.
  const polyfill: ScreenOrientationPolyfill = {
    get type(): OrientationType {
      return getNativeOrientation();
    },

    get angle(): number {
      return angleMap[this.type];
    },

    async lock(orientation: OrientationLockType): Promise<void> {
      if (lockedOrientation) {
        throw new DOMException("Orientation already locked", "InvalidStateError");
      }

      const _document = document as PartialDocumentSupport;
      const _orientation = screen.orientation as ScreenOrientationPolyfill;

      // Require fullscreen mode.
      if (!document.fullscreenElement && !_document.webkitFullscreenElement) {
        throw new DOMException("Requires fullscreen mode", "SecurityError");
      }

      // Attempt to use the native lock if supported.
      if (ORIENTATION_LOCK_SUPPORTED) {
        try {
          await _orientation.lock(orientation);
          lockedOrientation = orientation;
          return;
        } catch (err) {
          console.warn("Native orientation lock failed:", err);
        }
      }

      // For orientation "any", simply unlock.
      if (orientation === "any") {
        this.unlock();
        return;
      }

      // Otherwise, set our locked orientation and apply rotation.
      lockedOrientation = orientation;
      applyRotation();
    },

    unlock(): void {
      if (!lockedOrientation) return;
      const _orientation = screen.orientation as ScreenOrientationPolyfill;

      if (ORIENTATION_UNLOCK_SUPPORTED) {
        _orientation.unlock();
      } else {
        applyVisualRotation();
      }

      lockedOrientation = null;
    },

    get onchange(): EventListener | null {
      return null;
    },

    set onchange(listener: EventListener | null) {
      if (listener) this.addEventListener("change", listener);
    },

    addEventListener(
      type: "change",
      listener: (this: ScreenOrientationPolyfill, ev: Event) => any,
      options?: boolean | AddEventListenerOptions
    ): void {
      if (type === "change") listeners.add(listener as EventListener);
    },

    removeEventListener(
      type: "change",
      listener: (this: ScreenOrientationPolyfill, ev: Event) => any,
      options?: boolean | EventListenerOptions
    ): void {
      if (type === "change") listeners.delete(listener as EventListener);
    },

    dispatchEvent(event: Event): boolean {
      if (event.type === "change") {
        listeners.forEach((listener) => listener(event));
      }
      return true;
    },
  };

  // When fullscreen status changes, unlock the orientation if leaving fullscreen.
  const handleFullscreenChange = (): void => {
    isFullscreen = !!document.fullscreenElement;
    if (!isFullscreen && lockedOrientation) {
      polyfill.unlock();
    }
  };

  // Handle orientation changes by updating orientation state and reapplying any necessary rotation.
  const handleOrientationChange = (): void => {
    updateOrientation();
    if (lockedOrientation) {
      applyRotation();
    } else {
      applyVisualRotation();
    }
  };

  // Wire up event listeners.
  if (typeof window.addEventListener === "function") {
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  }

  return polyfill;
};

// If we are in a browser and the orientation lock/unlock APIs are supported, install the polyfill.
if (IS_BROWSER && ORIENTATION_LOCK_SUPPORTED && ORIENTATION_UNLOCK_SUPPORTED) {
  const polyfill = createScreenOrientationPolyfill();

  Object.defineProperty(screen, "_orientation", {
    value: polyfill,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}
