import { ComponentType, ReactElement, Suspense, isValidElement } from "react";
import { RouterErrorBoundary } from "../factory/RouterErrorBoundary";
import { RouteConfig, RouteConfigArray } from "../types";

/**
 * Shared cache for lazy-loaded components with performance metrics
 */
class RouterComponentCache {
  private cache = new Map<
    string,
    {
      component: ComponentType<any>;
      loadTime?: number;
      lastAccessed?: number;
    }
  >();

  set(key: string, component: ComponentType<any>, loadTime?: number) {
    this.cache.set(key, {
      component,
      loadTime,
      lastAccessed: Date.now(),
    });
  }

  get(key: string): ComponentType<any> | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccessed = Date.now();
      return entry.component;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getMetrics(key: string) {
    return this.cache.get(key);
  }
}

export const componentCache = new RouterComponentCache();

/**
 * Generates a unique and consistent key for route identification
 */
export const generateRouteKey = (
  path: string | undefined,
  index: number,
  isIndex: boolean,
): string => {
  const base = path || `route-${index}`;
  const type = isIndex ? "index" : "route";
  return `${base}-${type}`;
};

/**
 * Preloads and caches a lazy component with performance tracking
 */
export const preloadLazyComponent = async (
  lazyImport: () => Promise<{ default: ComponentType<any> }>,
  cacheKey: string,
): Promise<void> => {
  if (!componentCache.has(cacheKey)) {
    try {
      const startTime = performance.now();
      const module = await lazyImport();
      const loadTime = performance.now() - startTime;

      const component = module.default ?? module;
      if (typeof component === "function") {
        componentCache.set(cacheKey, component, loadTime);
      } else {
        console.warn(`Invalid component format for ${cacheKey}`);
      }
    } catch (error) {
      console.error(`Failed to preload component for ${cacheKey}:`, error);
      throw error; // Re-throw to handle at route level
    }
  }
};

/**
 * Smart suspense wrapper with error boundary and loading states
 */
export const wrapInSuspense = (
  element: ReactElement,
  fallback?: ReactElement,
  errorElement?: ReactElement,
): ReactElement => {
  if (!isValidElement(element)) {
    console.error("Invalid element provided to suspense wrapper");
    return errorElement || <div>Invalid route element </div>;
  }

  const defaultFallback = (
    <div className="loading" role="status" aria-live="polite">
      Loading...
    </div>
  );

  const suspenseElement = (
    <Suspense fallback={fallback || defaultFallback}>{element}</Suspense>
  );

  return errorElement ? (
    <RouterErrorBoundary>{suspenseElement} </RouterErrorBoundary>
  ) : (
    suspenseElement
  );
};

/**
 * Bulk preload routes for performance optimization
 */
export const preloadRoutes = async (
  routes: RouteConfigArray,
  options: {
    parallel?: boolean;
    onProgress?: (loaded: number, total: number) => void;
  } = {},
): Promise<void> => {
  const { parallel = true, onProgress } = options;
  const total = routes.length;
  let loaded = 0;

  const preloadRoute = async (route: RouteConfig) => {
    if (route.lazy && route.componentId) {
      await preloadLazyComponent(route.lazy, route.componentId);
      loaded++;
      onProgress?.(loaded, total);
    }
    if (route.children?.length) {
      await preloadRoutes(route.children, options);
    }
  };

  if (parallel) {
    await Promise.all(routes.map(preloadRoute));
  } else {
    for (const route of routes) {
      await preloadRoute(route);
    }
  }
};

/**
 * Creates a type-safe guard chain for route processing
 */
export const createGuardChain = (
  element: ReactElement,
  guards: Array<(el: ReactElement) => ReactElement>,
  errorHandler?: (error: Error) => ReactElement,
): ReactElement => {
  try {
    return guards.reduce((el, guard) => guard(el), element);
  } catch (error) {
    console.error("Guard chain execution failed:", error);
    return errorHandler?.(error as Error) || <div>Route access denied </div>;
  }
};
