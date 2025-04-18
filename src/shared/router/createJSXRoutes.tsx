import {
  ReactElement,
  Suspense,
  lazy,
  isValidElement,
  ComponentType,
} from "react";
import { Route } from "react-router";
import { RouteConfig } from "./types";
import { RouterErrorBoundary } from "./RouterErrorBoundary";

const componentCache = new Map<string, ComponentType>();

const generateRouteKey = (
  path: string | undefined,
  index: number,
  isIndex: boolean,
): string =>
  path ? `${path}-${isIndex ? "index" : "route"}` : `route-${index}`;

const preloadLazyComponent = async (
  lazyImport: () => Promise<any>,
  cacheKey: string,
) => {
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
};

const wrapInSuspense = (element: ReactElement, errorElement?: ReactElement) => {
  const suspenseElement = (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      {element}
    </Suspense>
  );
  return errorElement ? (
    <RouterErrorBoundary>{suspenseElement}</RouterErrorBoundary>
  ) : (
    suspenseElement
  );
};

export const createJSXRoutes = (routes: RouteConfig[]): ReactElement[] => {
  return routes.map((route, index) => {
    const {
      path,
      index: isIndex = false,
      loader,
      action,
      errorElement,
      guard,
      meta,
      handle,
      children,
      lazy: lazyImport,
      componentId,
      element: directElement,
    } = route;

    let element: ReactElement = <div>Route not configured</div>;

    if (lazyImport && componentId) {
      const cacheKey = componentId;

      preloadLazyComponent(lazyImport, cacheKey);

      const CachedComponent = componentCache.get(cacheKey);
      const LazyComponent = CachedComponent ?? lazy(lazyImport);
      const lazyElement = <LazyComponent />;
      element = wrapInSuspense(lazyElement, errorElement);
    } else if (directElement && isValidElement(directElement)) {
      element = directElement;
    }
    if (guard) {
      try {
        element = guard(element);
      } catch (err) {
        console.error(`Guard error at ${path ?? "index"}:`, err);
        element = errorElement ?? <div>Access denied</div>;
      }
    }

    const routeKey = generateRouteKey(path, index, isIndex);

    const routeProps = {
      key: routeKey,
      element,
      errorElement,
      loader,
      action,
      handle,
      ...(meta && { meta }),
    };

    return isIndex ? (
      <Route {...routeProps} index />
    ) : (
      <Route {...routeProps} path={path}>
        {children ? createJSXRoutes(children) : null}
      </Route>
    );
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
      if (route.children?.length) {
        await preloadAllRoutes(route.children);
      }
    }),
  );
};
