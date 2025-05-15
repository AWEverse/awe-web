export const ROUTER_DEFAULTS = {
  LOADING_FALLBACK: (
    <div className="loading" role="status" aria-live="polite">
      Loading...
    </div>
  ),
  ERROR_FALLBACK: <div role="alert"> Something went wrong </div>,
  ACCESS_DENIED: <div role="alert"> Access Denied </div>,
  NOT_CONFIGURED: <div role="alert"> Route not configured </div>,
} as const;

export const ROUTE_TYPES = {
  INDEX: "index",
  ROUTE: "route",
} as const;
