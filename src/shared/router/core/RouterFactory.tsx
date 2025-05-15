import { ReactElement, useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import type { RouteConfigArray } from "../types";
import { createRoutesFromConfig } from "./routeFactory";
import { preloadRoutes } from "./utils";

interface RouterFactoryProps {
  routes: RouteConfigArray;
  preloadAll?: boolean;
  onRoutePreload?: (loaded: number, total: number) => void;
}

/**
 * Enhanced router factory with preloading and performance monitoring
 */
export const RouterFactory = ({
  routes,
  preloadAll = false,
  onRoutePreload,
}: RouterFactoryProps): ReactElement => {
  const router = useMemo(
    () => createBrowserRouter(createRoutesFromConfig(routes)),
    [routes],
  );

  useEffect(() => {
    if (preloadAll) {
      (async () => {
        try {
          const totalRoutes = routes.reduce((count, route) => {
            return count + 1 + (route.children?.length || 0);
          }, 0);

          await preloadRoutes(routes, {
            parallel: true,
            onProgress: (loaded) => {
              onRoutePreload?.(loaded, totalRoutes);
            },
          });
        } catch (error) {
          console.error("Failed to preload routes:", error);
        }
      })();
    }
  }, [routes, preloadAll, onRoutePreload]);

  return <RouterProvider router={router} />;
};

/**
 * Create a standalone router instance
 */
export const createRouter = (routes: RouteConfigArray) => {
  return createBrowserRouter(createRoutesFromConfig(routes));
};
