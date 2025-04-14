// Type definitions based on the standard Screen Orientation API
type POrientationType = "portrait-primary" | "landscape-primary" | "portrait-secondary" | "landscape-secondary";
type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

interface ScreenOrientationPolyfill extends Omit<ScreenOrientation, "type" | "lock" | "unlock"> {
  type: POrientationType;
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
}

// Helper interface for partial document support
interface PartialDocumentSupport extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

// CSS to override the user agent stylesheet for fullscreen transform
const injectCSS = () => {
  const styleId = 'orientation-polyfill-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Container for the rotated content */
    .orientation-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      z-index: 2147483647; /* Highest possible z-index */
    }

    /* Element that gets rotated */
    .orientation-wrapper {
      transform-origin: center center;
      transition: transform 0.3s ease-in-out;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Override user agent styles for fullscreen elements */
    :fullscreen .orientation-wrapper,
    :-webkit-full-screen .orientation-wrapper,
    :-moz-full-screen .orientation-wrapper,
    :-ms-fullscreen .orientation-wrapper {
      transform: var(--orientation-transform, none) !important;
    }

    /* Swap dimensions for landscape orientations */
    .orientation-wrapper.landscape-primary,
    .orientation-wrapper.landscape-secondary {
      width: 100vh;
      height: 100vw;
    }

    /* Style for content inside the wrapper */
    .orientation-content {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  `;
  document.head.appendChild(style);
};

// Create DOM structure for orientation handling
const setupDOMStructure = () => {
  // Check if structure already exists
  if (document.querySelector('.orientation-container')) return;

  // Create container and wrapper
  const container = document.createElement('div');
  container.className = 'orientation-container';

  const wrapper = document.createElement('div');
  wrapper.className = 'orientation-wrapper';

  const content = document.createElement('div');
  content.className = 'orientation-content';

  // Move all body children to content
  while (document.body.firstChild) {
    content.appendChild(document.body.firstChild);
  }

  // Build structure
  wrapper.appendChild(content);
  container.appendChild(wrapper);
  document.body.appendChild(container);

  return { container, wrapper, content };
};

// Helper function to detect the current orientation
const detectOrientation = (): POrientationType => {
  const portrait = matchMedia("(orientation: portrait)").matches;
  const isPrimary = window.innerHeight >= window.innerWidth;
  if (portrait) return isPrimary ? "portrait-primary" : "portrait-secondary";
  return isPrimary ? "landscape-secondary" : "landscape-primary";
};

// Function to apply visual rotation based on orientation
const applyVisualRotation = (orientation: POrientationType): void => {
  const wrapper = document.querySelector('.orientation-wrapper');
  if (!wrapper) return;

  // Remove previous orientation classes
  wrapper.classList.remove('portrait-primary', 'landscape-primary', 'portrait-secondary', 'landscape-secondary');

  // Add current orientation class
  wrapper.classList.add(orientation);

  // Apply rotation transform based on orientation
  const angleMap: Record<POrientationType, number> = {
    "portrait-primary": 0,
    "landscape-primary": 90,
    "portrait-secondary": 180,
    "landscape-secondary": -90,
  };

  const angle = angleMap[orientation];
  wrapper.style.setProperty('--orientation-transform', `rotate(${angle}deg)`);
};

// Main function to create the polyfill
export const createScreenOrientationPolyfill = (): ScreenOrientationPolyfill => {
  // Inject required CSS
  injectCSS();

  let lockedOrientation: OrientationLockType | null = null;
  let currentOrientation: POrientationType = detectOrientation();
  const listeners = new Set<(event: Event) => void>();

  // Create the DOM structure if in fullscreen mode or before locking
  let domStructure: ReturnType<typeof setupDOMStructure> | undefined;

  const angleMap: Record<POrientationType, number> = {
    "portrait-primary": 0,
    "landscape-primary": 90,
    "portrait-secondary": 180,
    "landscape-secondary": -90,
  };

  const matchPOrientationType = (lock: OrientationLockType): POrientationType => {
    switch (lock) {
      case "portrait":
        return "portrait-primary";
      case "landscape":
        return "landscape-primary";
      case "natural":
        return window.innerHeight >= window.innerWidth ? "portrait-primary" : "landscape-primary";
      case "any":
        return detectOrientation();
      default:
        return lock as POrientationType;
    }
  };

  const updateOrientation = (newOrientation: POrientationType) => {
    if (currentOrientation !== newOrientation) {
      currentOrientation = newOrientation;
      const event = new Event("change");
      listeners.forEach((l) => l(event));
      if (polyfill.onchange) polyfill.onchange(event);
    }
  };

  const handleOrientationChange = () => {
    const newOrientation = detectOrientation();

    if (lockedOrientation) {
      const target = matchPOrientationType(lockedOrientation);
      updateOrientation(target);
      applyVisualRotation(target);
    } else {
      updateOrientation(newOrientation);
      applyVisualRotation(newOrientation);
    }
  };

  // Helper function to request fullscreen with cross-browser support
  const requestFullscreen = async (element: HTMLElement): Promise<void> => {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen();
    }
    throw new Error("Fullscreen API not supported");
  };

  // Helper function to exit fullscreen with cross-browser support
  const exitFullscreen = async (): Promise<void> => {
    const doc = document as PartialDocumentSupport;

    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      return doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      return doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      return doc.msExitFullscreen();
    }
  };

  // Function to check if currently in fullscreen mode
  const isInFullscreen = (): boolean => {
    const doc = document as PartialDocumentSupport;
    return !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  };

  const polyfill: ScreenOrientationPolyfill = {
    get type() {
      return currentOrientation;
    },

    get angle() {
      return angleMap[currentOrientation];
    },

    async lock(orientation: OrientationLockType): Promise<void> {
      // If orientation is "any", just unlock
      if (orientation === "any") {
        this.unlock();
        return;
      }

      // Setup DOM structure if not already done
      if (!domStructure) {
        domStructure = setupDOMStructure();
      }

      // Request fullscreen if not already in fullscreen mode
      if (!isInFullscreen()) {
        try {
          await requestFullscreen(document.documentElement);
        } catch (error) {
          throw new DOMException("Fullscreen request failed", "SecurityError");
        }
      }

      lockedOrientation = orientation;
      const target = matchPOrientationType(orientation);
      updateOrientation(target);
      applyVisualRotation(target);
    },

    unlock() {
      if (!lockedOrientation) return;

      lockedOrientation = null;
      const newOrientation = detectOrientation();
      updateOrientation(newOrientation);
      applyVisualRotation(newOrientation);

      // Exit fullscreen if we're in it
      if (isInFullscreen()) {
        exitFullscreen().catch(console.error);
      }
    },

    onchange: null,

    addEventListener(type: string, listener: EventListener): void {
      if (type === "change") listeners.add(listener as (event: Event) => void);
    },

    removeEventListener(type: string, listener: EventListener): void {
      if (type === "change") listeners.delete(listener as (event: Event) => void);
    },

    dispatchEvent(event: Event): boolean {
      if (event.type === "change") {
        listeners.forEach((l) => l(event));
        return true;
      }
      return false;
    },
  };

  // Set up event listeners
  window.addEventListener("orientationchange", handleOrientationChange);
  window.addEventListener("resize", handleOrientationChange);
  document.addEventListener("fullscreenchange", handleOrientationChange);
  document.addEventListener("webkitfullscreenchange", handleOrientationChange);
  document.addEventListener("mozfullscreenchange", handleOrientationChange);
  document.addEventListener("MSFullscreenChange", handleOrientationChange);

  return polyfill;
};

// Install the polyfill if screen orientation API is not available
export const installOrientationPolyfill = () => {
  if (typeof window !== "undefined" &&
    typeof screen !== "undefined" &&
    (!screen.orientation || !screen.orientation.lock)) {

    const polyfill = createScreenOrientationPolyfill();

    Object.defineProperty(screen, "orientation", {
      configurable: true,
      enumerable: true,
      get: () => polyfill,
    });

    console.log("Screen Orientation API polyfill installed");
  }
};

// Auto-install if in browser environment
if (typeof window !== "undefined" && typeof screen !== "undefined") {
  if (!screen.orientation || !screen.orientation.lock) {
    installOrientationPolyfill();
  }
}

// Export a function to manually check for orientation support
export const isOrientationSupported = (): boolean => {
  return typeof screen !== "undefined" &&
    !!screen.orientation &&
    typeof screen.orientation.lock === "function";
};
