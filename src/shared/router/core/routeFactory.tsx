import { ReactElement, lazy } from "react";
import { RouteObject } from "react-router";
import type { RouteConfig, RouteConfigArray } from "../types";
import { componentCache } from "./cache";
import { wrapInSuspense, createGuardChain } from "./utils";

const ROUTE_TYPES = {
  INDEX: "index",
  ROUTE: "route",
} as const;

const ROUTER_DEFAULTS = {
  NOT_CONFIGURED: <div role="alert">Route not configured</div>,
  ACCESS_DENIED: <div role="alert">Access Denied</div>,
} as const;

/**
 * Generates a unique key for each route based on its path, index, and type (index or regular route).
 */
const generateRouteKey = (
  path: string | undefined,
  index: number,
  isIndex: boolean,
): string => {
  const base = path || `route-${index}`;
  const type = isIndex ? ROUTE_TYPES.INDEX : ROUTE_TYPES.ROUTE;
  return `${base}-${type}`;
};

/**
 * Creates route objects with improved performance and error handling
 */
export const createRoutesFromConfig = (
  routes: RouteConfigArray,
  parentPath = "",
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

    const routeKey = id || generateRouteKey(path, index, isIndex);
    const fullPath = path ? `${parentPath}${path}` : parentPath;

    let element: ReactElement = staticElement || ROUTER_DEFAULTS.NOT_CONFIGURED;

    if (lazyImport && componentId) {
      const CachedComponent = componentCache.get(componentId);
      if (CachedComponent) {
        element = <CachedComponent />;
      } else {
        const LazyComponent = lazy(lazyImport);
        element = <LazyComponent />;
      }
      element = wrapInSuspense(element, undefined, errorElement);
    }

    if (guard) {
      element = createGuardChain(
        element,
        Array.isArray(guard) ? guard : [guard],
        () => errorElement || ROUTER_DEFAULTS.ACCESS_DENIED,
      );
    }

    const baseRouteObject = {
      loader,
      action,
      errorElement,
      element,
      handle,
      ...(meta && { meta }),
    };

    return isIndex
      ? {
          index: true,
          id: routeKey,
          ...baseRouteObject,
        }
      : {
          path: fullPath,
          id: routeKey,
          ...baseRouteObject,
          ...(children && {
            children: createRoutesFromConfig(children, fullPath),
          }),
        };
  });
};
