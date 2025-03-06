import { IS_BROWSER } from "../os";
import { ORIENTATION_LOCK_SUPPORTED, ORIENTATION_UNLOCK_SUPPORTED } from "../os/support/browser";

type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

interface ScreenOrientationPolyfill extends Omit<ScreenOrientation, 'type' | 'lock' | 'unlock'> {
  type: OrientationType;
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): Promise<void>;
  addEventListener(type: 'change', listener: (this: this, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: 'change', listener: (this: this, ev: Event) => any, options?: boolean | EventListenerOptions): void;
}

const createScreenOrientationPolyfill = (): ScreenOrientationPolyfill => {
  let lockedOrientation: OrientationLockType | null = null;
  let isFullscreen = false;
  const listeners = new Set<EventListener>();

  const angleMap: Record<OrientationType, number> = {
    'portrait-primary': 0,
    'landscape-primary': 90,
    'portrait-secondary': 180,
    'landscape-secondary': -90,
  };

  const getNativeOrientation = (): OrientationType => {
    if (screen.orientation?.type) return screen.orientation.type as OrientationType;

    const angle = window.orientation ||
      (screen.orientation as any)?.angle ||
      (matchMedia('(orientation: portrait)').matches ? 0 : 90);
    switch (Math.abs(angle)) {
      case 90: return 'landscape-primary';
      case 180: return 'portrait-secondary';
      default: return 'portrait-primary';
    }
  };

  const updateOrientation = (): void => {
    const event = new Event('change');
    listeners.forEach(listener => listener(event));
    if (polyfill.onchange) polyfill.onchange(event);
  };

  const applyVisualRotation = (degrees?: number): void => {
    const targetElement = (document.fullscreenElement || document.documentElement) as HTMLElement;
    if (degrees !== undefined) {
      targetElement.style.transform = `rotate(${degrees}deg)`;
      targetElement.style.transformOrigin = 'center center';
      targetElement.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      targetElement.style.transform = '';
      targetElement.style.transition = '';
    }
  };

  const getRotation = (): number => {
    if (!lockedOrientation) return 0;
    const currentType = getNativeOrientation();
    const currentAngle = angleMap[currentType];
    if (lockedOrientation === 'landscape') {
      if (currentType.startsWith('portrait')) {
        const targetAngle = angleMap['landscape-primary'];
        return targetAngle - currentAngle;
      }
      return 0;
    } else if (lockedOrientation === 'portrait') {
      if (currentType.startsWith('landscape')) {
        const targetAngle = angleMap['portrait-primary'];
        return targetAngle - currentAngle;
      }
      return 0;
    } else {
      const targetAngle = angleMap[lockedOrientation as OrientationType];
      return targetAngle - currentAngle;
    }
  };

  const applyRotation = () => {
    const rotation = getRotation();
    applyVisualRotation(rotation);
  };

  const polyfill: ScreenOrientationPolyfill = {
    get type(): OrientationType {
      return getNativeOrientation();
    },

    get angle(): number {
      return angleMap[this.type];
    },

    async lock(orientation: OrientationLockType): Promise<void> {
      if (lockedOrientation) {
        throw new DOMException('Orientation already locked', 'InvalidStateError');
      }

      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        throw new DOMException('Requires fullscreen mode', 'SecurityError');
      }

      if (ORIENTATION_LOCK_SUPPORTED) {
        try {
          await (screen.orientation as any).lock(orientation);
          lockedOrientation = orientation;
          return;
        } catch (err) {
          console.warn('Native orientation lock failed:', err);
        }
      }

      if (orientation === 'any') {
        await this.unlock();
        return;
      }

      lockedOrientation = orientation;
      applyRotation();
    },

    async unlock(): Promise<void> {
      if (!lockedOrientation) return;

      if (ORIENTATION_UNLOCK_SUPPORTED) {
        (screen.orientation as any).unlock();
      } else {
        applyVisualRotation();
      }

      lockedOrientation = null;
    },

    get onchange(): EventListener | null {
      return null;
    },

    set onchange(listener: EventListener | null) {
      if (listener) this.addEventListener('change', listener);
    },

    addEventListener(type: 'change', listener: EventListener): void {
      if (type === 'change') listeners.add(listener);
    },

    removeEventListener(type: 'change', listener: EventListener): void {
      if (type === 'change') listeners.delete(listener);
    },

    dispatchEvent(event: Event): boolean {
      if (event.type === 'change') {
        listeners.forEach(listener => listener(event));
      }
      return true;
    }
  };

  const handleFullscreenChange = () => {
    isFullscreen = !!document.fullscreenElement;
    if (!isFullscreen && lockedOrientation) {
      polyfill.unlock();
    }
  };

  const handleOrientationChange = () => {
    updateOrientation();
    if (lockedOrientation) {
      applyRotation();
    } else {
      applyVisualRotation();
    }
  };

  if ('addEventListener' in window) {
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  }

  return polyfill;
};

if (IS_BROWSER && ORIENTATION_LOCK_SUPPORTED && ORIENTATION_UNLOCK_SUPPORTED) {
  const polyfill = createScreenOrientationPolyfill();
  Object.defineProperty(screen, 'orientation', {
    value: polyfill,
    writable: true,
    configurable: true,
    enumerable: true
  });
}
