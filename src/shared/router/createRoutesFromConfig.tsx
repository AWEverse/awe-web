import React, { Suspense, ReactElement, lazy } from "react";
import { RouteObject } from "react-router";
import { RouteConfig } from "./types";

const componentCache = new Map<string, React.ComponentType>();

const generateRouteKey = (path?: string, index = 0, isIndex = false): string =>
  path ? `${path}-${isIndex ? "index" : "route"}` : `route-${index}`;

const preloadLazyComponent = async (
  lazyImport: () => Promise<any>,
  cacheKey: string,
) => {
  if (!componentCache.has(cacheKey)) {
    try {
      const module = await lazyImport();
      const Component = module.default || module;
      componentCache.set(cacheKey, Component);
    } catch (error) {
      console.error(`Failed to preload component: ${cacheKey}`, error);
    }
  }
};

const wrapWithSuspense = (Component: React.ComponentType): ReactElement => (
  <Suspense
    fallback={
      <div className="loading" aria-live="polite">
        Loading...
      </div>
    }
  >
    <Component />
  </Suspense>
);

export const createRoutesFromConfig = (
  routes: RouteConfig[],
): RouteObject[] => {
  return routes.map((route, index) => {
    const {
      path,
      index: isIndex = false,
      id,
      loader,
      action,
      errorElement,
      guard,
      handle,
      meta,
      children,
      lazy: lazyImport,
      element: staticElement,
      componentId,
    } = route;

    let element: ReactElement = staticElement || (
      <div>Route not configured</div>
    );

    if (lazyImport && componentId) {
      const cacheKey = componentId;
      preloadLazyComponent(lazyImport, cacheKey);

      const CachedComponent = componentCache.get(cacheKey) || lazy(lazyImport);

      element = wrapWithSuspense(CachedComponent);
    }

    if (guard) {
      try {
        element = guard(element);
      } catch (error) {
        console.error(`Guard failed for route: ${path || "index"}`, error);
        element = errorElement || <div>Access Denied</div>;
      }
    }

    return {
      ...(isIndex
        ? {
            index: true as const,
            id: id || generateRouteKey(path, index, isIndex),
            loader,
            action,
            errorElement,
            handle,
            element,
            ...(meta && { meta }),
          }
        : {
            path,
            id: id || generateRouteKey(path, index, isIndex),
            loader,
            action,
            errorElement,
            handle,
            element,
            ...(meta && { meta }),
            ...(children && { children: createRoutesFromConfig(children) }),
          }),
    } as RouteObject;
  });
};

export const preloadAllRoutes = async (
  routes: RouteConfig[],
): Promise<void> => {
  await Promise.all(
    routes.map(async (route) => {
      if (route.lazy && route.componentId) {
        await preloadLazyComponent(route.lazy, route.componentId);
      }
      if (route.children) {
        await preloadAllRoutes(route.children);
      }
    }),
  );
};
