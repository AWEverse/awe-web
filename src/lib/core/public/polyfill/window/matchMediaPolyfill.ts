function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false,
): T {
  let timeout: number | undefined;

  return function (this: any, ...args: any[]) {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => {
      timeout = undefined;

      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);

    // call now
    if (immediate && timeout === undefined) {
      func.apply(this, args);
    }
  } as T;
}

export const MATCH_MEDIA_SUPPORTED = typeof window.matchMedia !== "function";

function createMatchMediaPolyfill() {
  const registryKey = "__matchMediaPolyfillRegistry";

  if (!(window as any)[registryKey]) {
    (window as any)[registryKey] = [];

    const debouncedGlobalUpdate = debounce(() => {
      (window as any)[registryKey].forEach((mql: any) => mql._update());
    }, 100);

    window.addEventListener("resize", debouncedGlobalUpdate);
  }

  window.matchMedia = function (query: string): MediaQueryList {
    const minWidthMatch = query.match(/\(min-width:\s*(\d+)px\)/);
    const maxWidthMatch = query.match(/\(max-width:\s*(\d+)px\)/);
    const orientationMatch = query.match(/\(orientation:\s*(\w+)\)/);

    const minWidth = minWidthMatch ? parseInt(minWidthMatch[1], 10) : null;
    const maxWidth = maxWidthMatch ? parseInt(maxWidthMatch[1], 10) : null;
    const orientation = orientationMatch ? orientationMatch[1] : null;

    // Helper to compute the current match state.
    const computeMatches = (width: number, height: number): boolean =>
      (minWidth === null || width >= minWidth) &&
      (maxWidth === null || width <= maxWidth) &&
      (!orientation ||
        (orientation === "landscape"
          ? width > height
          : orientation === "portrait"
            ? height > width
            : true));

    let matches = computeMatches(window.innerWidth, window.innerHeight);

    const listeners: Array<
      ((ev: MediaQueryListEvent) => any) | EventListenerOrEventListenerObject
    > = [];

    // Create the polyfill object.
    const mql: MediaQueryList & { _update?: () => void } = {
      get matches() {
        return matches;
      },
      get media() {
        return query;
      },
      onchange: null,
      addListener(
        callback:
          | ((this: MediaQueryList, ev: MediaQueryListEvent) => any)
          | null,
      ): void {
        if (callback) {
          listeners.push(callback);
        }
      },
      removeListener(
        callback:
          | ((this: MediaQueryList, ev: MediaQueryListEvent) => any)
          | null,
      ): void {
        if (callback) {
          const index = listeners.indexOf(callback);
          if (index !== -1) {
            listeners.splice(index, 1);
          }
        }
      },
      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ): void {
        if (type === "change" && listener) {
          listeners.push(listener);
        }
      },
      removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ): void {
        if (type === "change" && listener) {
          const index = listeners.indexOf(listener);
          if (index !== -1) {
            listeners.splice(index, 1);
          }
        }
      },
      dispatchEvent(_: Event): boolean {
        return false;
      },
    };

    function update() {
      const newMatches = computeMatches(
        window.innerWidth,
        window.innerHeight,
      );
      if (newMatches !== matches) {
        matches = newMatches;
        const event = new Event("change") as MediaQueryListEvent;
        // Add custom properties.
        (event as any).media = query;
        (event as any).matches = matches;
        // Notify all listeners.
        listeners.forEach((listener) => {
          if (typeof listener === "function") {
            listener.call(mql, event);
          } else if (listener && typeof listener.handleEvent === "function") {
            listener.handleEvent(event);
          }
        });

        if (typeof mql.onchange === "function") {
          mql.onchange.call(mql, event);
        }
      }
    }

    // Attach the update function so that the global handler can call it.
    mql._update = update;
    // Register this media query in the global registry.
    (window as any)[registryKey].push(mql);

    return mql as MediaQueryList;
  };
}

export default createMatchMediaPolyfill;
