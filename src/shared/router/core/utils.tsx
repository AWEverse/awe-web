import React, { ReactElement, ComponentType } from 'react';
import { ROUTER_DEFAULTS } from './constants';
import { RouterErrorBoundary } from '../RouterErrorBoundary';
import { componentCache } from './cache';

export async function preloadLazyComponent(
  lazyImport: () => Promise<{ default: ComponentType<any> }>,
  cacheKey: string
): Promise<void> {
  if (!componentCache.has(cacheKey)) {
    try {
      const startTime = performance.now();
      const module = await lazyImport();
      const loadTime = performance.now() - startTime;

      const component = module.default;
      if (typeof component === 'function') {
        componentCache.set(cacheKey, component, loadTime);
      }
    } catch (error) {
      console.error(`Failed to preload component for ${cacheKey}:`, error);
      throw error;
    }
  }
}

export function wrapInSuspense(
  element: ReactElement,
  fallback?: ReactElement,
  errorElement?: ReactElement
): ReactElement {
  if (!React.isValidElement(element)) {
    console.error('Invalid element provided to suspense wrapper');
    return errorElement || ROUTER_DEFAULTS.ERROR_FALLBACK;
  }

  const suspenseElement = (
    <React.Suspense fallback= { fallback || ROUTER_DEFAULTS.LOADING_FALLBACK
}>
  { element }
  </React.Suspense>
  );

return errorElement ? (
  <RouterErrorBoundary>{ suspenseElement } </RouterErrorBoundary>
) : (
  suspenseElement
);
}

export function createGuardChain(
  element: ReactElement,
  guards: Array<(el: ReactElement) => ReactElement>,
  errorHandler?: (error: Error) => ReactElement
): ReactElement {
  try {
    return guards.reduce((el, guard) => guard(el), element);
  } catch (error) {
    console.error('Guard chain execution failed:', error);
    return errorHandler?.(error as Error) || ROUTER_DEFAULTS.ACCESS_DENIED;
  }
}

export async function preloadRoutes(
  routes: RouteConfigArray,
  options: {
    parallel?: boolean;
    onProgress?: (loaded: number) => void;
  } = {}
): Promise<void> {
  const { parallel = true, onProgress } = options;
  let loaded = 0;

  const preloadRoute = async (route: RouteConfig) => {
    if (route.lazy && route.componentId) {
      await preloadLazyComponent(route.lazy, route.componentId);
      loaded++;
      onProgress?.(loaded);
    }
    if (route.children?.length) {
      if (parallel) {
        await Promise.all(route.children.map(preloadRoute));
      } else {
        for (const child of route.children) {
          await preloadRoute(child);
        }
      }
    }
  };

  if (parallel) {
    await Promise.all(routes.map(preloadRoute));
  } else {
    for (const route of routes) {
      await preloadRoute(route);
    }
  }
}
