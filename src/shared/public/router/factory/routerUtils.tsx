import { ReactElement, Suspense, ComponentType } from "react";

/**
 * Shared cache for lazy-loaded components by ID.
 */
export const componentCache = new Map<string, ComponentType<any>>();

/**
 * Generate a unique key for a route based on path, index, and isIndex.
 */
export function generateRouteKey(
  path: string | undefined,
  index: number,
  isIndex: boolean,
): string {
  return path ? `${path}-${isIndex ? "index" : "route"}` : `route-${index}`;
}

/**
 * Preload a lazy component and cache it by key.
 */
export async function preloadLazyComponent(
  lazyImport: () => Promise<any>,
  cacheKey: string,
): Promise<void> {
  if (!componentCache.has(cacheKey)) {
    try {
      const module = await lazyImport();
      const component = module.default ?? module;
      if (typeof component === "function") {
        componentCache.set(cacheKey, component);
      }
    } catch (error) {
      console.error(`Failed to preload component for ${cacheKey}:`, error);
    }
  }
}

/**
 * Wrap a React element in Suspense and optionally an error boundary.
 *
 * @param element The element to wrap
 * @param ErrorBoundary Optional error boundary component
 */
export function wrapInSuspense(
  element: ReactElement,
  ErrorBoundary?: ComponentType<{ children: ReactElement }>,
): ReactElement {
  const suspenseElement = (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      {element}
    </Suspense>
  );
  if (ErrorBoundary) {
    return <ErrorBoundary>{suspenseElement}</ErrorBoundary>;
  }
  return suspenseElement;
}
