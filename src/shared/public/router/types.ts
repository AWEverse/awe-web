import {
  ReactElement,
  ComponentType,
  LazyExoticComponent,
} from "react";
import {
  LoaderFunction,
  ActionFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "react-router";

export type GuardFunction = (el: ReactElement) => ReactElement;

export type MetaData = {
  requiresAuth?: boolean;
  roles?: string[];
  title?: string;
  description?: string;
  keywords?: string[];
  [key: string]: any;
};

export type HandleData = {
  crumb?: string;
  icon?: ReactElement;
  analytics?: Record<string, any>;
  [key: string]: any;
};

export interface BaseRoute {
  path?: string;
  index?: boolean;
  id?: string;
  loader?: LoaderFunction;
  action?: ActionFunction;
  errorElement?: ReactElement;
  guard?: GuardFunction;
  meta?: MetaData;
  handle?: HandleData;
  shouldRevalidate?: (args: { currentUrl: URL; nextUrl: URL }) => boolean;
}

export interface SyncRoute extends BaseRoute {
  componentId: string;
  element: ReactElement;
  lazy?: never;
  children?: RouteConfig[];
}

export interface LazyRoute extends BaseRoute {
  componentId: string;
  lazy: () => Promise<{ default: ComponentType<any> }>;
  element?: never;
  children?: RouteConfig[];
}

export type RouteConfig = SyncRoute | LazyRoute;

// Optional: Type for loader/action arguments
export type RouteLoaderArgs = LoaderFunctionArgs;
export type RouteActionArgs = ActionFunctionArgs;

// Type for lazy component
export type LazyComponentType = LazyExoticComponent<ComponentType<any>>;

// Type for route configuration array
export type RouteConfigArray = RouteConfig[];

// Type for route rendering function
export type RouteRenderer = (routes: RouteConfigArray) => ReactElement[];

// Type for preload function
export type PreloadFunction = (routes: RouteConfigArray) => Promise<void>;
