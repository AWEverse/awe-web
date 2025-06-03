# AWE Router

A powerful and flexible routing solution for React applications, built on top of react-router-dom with additional features for enterprise applications.

## Features

- 🚀 **Lazy Loading Support**: Efficient code-splitting with automatic component preloading
- 🛡️ **Route Guards**: Protect routes with custom guard functions
- 📦 **Component Caching**: Smart caching system for lazy-loaded components
- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🔄 **Automatic Preloading**: Optional preloading of all routes in production
- 📊 **Performance Monitoring**: Built-in performance tracking for route loading
- 🌳 **Nested Routes**: Full support for nested route configurations
- 🎨 **Metadata & Analytics**: Rich metadata and analytics support per route

## Usage

### Basic Setup

```tsx
import { RouterFactory } from '@/shared/router';
import type { RouteConfig } from '@/shared/router/types';

const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Layout />,
    componentId: 'layout',
    children: [
      {
        index: true,
        element: <Home />,
        componentId: 'home'
      },
      {
        path: 'dashboard',
        lazy: () => import('./pages/Dashboard'),
        componentId: 'dashboard',
        guard: requireAuth,
        meta: {
          requiresAuth: true,
          roles: ['user']
        }
      }
    ]
  }
];

export const App = () => (
  <RouterFactory
    routes={routes}
    preloadAll={process.env.NODE_ENV === 'production'}
    onRoutePreload={(loaded, total) => {
      console.debug(`Loading progress: ${loaded}/${total}`);
    }}
  />
);
```

### Route Configuration

Each route can be configured with the following options:

```typescript
interface RouteConfig {
  path?: string;                // Route path
  index?: boolean;              // Is this an index route?
  id?: string;                  // Unique route identifier
  componentId: string;          // Component cache identifier
  element?: ReactElement;       // Sync rendered element
  lazy?: () => Promise<any>;    // Lazy-loaded component
  guard?: GuardFunction;        // Route guard function(s)
  meta?: MetaData;             // Route metadata
  handle?: HandleData;         // Custom route handlers
  loader?: LoaderFunction;     // Data loading function
  action?: ActionFunction;     // Form action handler
  errorElement?: ReactElement; // Error fallback UI
  children?: RouteConfig[];    // Nested routes
}
```

### Route Guards

Protect routes with guard functions:

```typescript
const requireAuth: GuardFunction = (element) => {
  const isAuthenticated = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const checkRole: GuardFunction = (element) => {
  const { hasRole } = useAuth();
  return hasRole('admin') ? element : <AccessDenied />;
};
```

### Metadata & Analytics

Add rich metadata to routes:

```typescript
{
  path: 'product/:id',
  meta: {
    title: 'Product Details',
    description: 'View product details and specifications',
    requiresAuth: true,
    roles: ['user']
  },
  handle: {
    crumb: 'Product',
    analytics: {
      pageType: 'product',
      section: 'catalog'
    }
  }
}
```

## Performance Optimizations

- Component caching with LRU eviction
- Parallel route preloading in production
- Automatic code splitting
- Smart suspense boundaries
- Route-level error handling

## API Reference

### RouterFactory

Main component for setting up the router:

```typescript
interface RouterFactoryProps {
  routes: RouteConfig[];
  preloadAll?: boolean;
  onRoutePreload?: (loaded: number, total: number) => void;
}
```

### Utilities

```typescript
// Preload specific routes
await preloadRoutes(routes, {
  parallel: true,
  onProgress: (loaded) => console.log(`Loaded ${loaded} routes`)
});

// Create standalone router instance
const router = createRouter(routes);
```

## Best Practices

1. Always provide a unique `componentId` for routes
2. Use lazy loading for non-critical routes
3. Implement route guards for protected content
4. Add meaningful metadata for SEO and analytics
5. Provide error boundaries for route-level error handling
6. Use nested routes for complex layouts
7. Monitor route loading performance in production

## Error Handling

The router provides multiple layers of error handling:

- Route-level `errorElement`
- Suspense boundaries for lazy loading
- Guard chain error handling
- Global error boundary fallback

## TypeScript Support

Full type safety with comprehensive interfaces and type guards:

```typescript
import type {
  RouteConfig,
  GuardFunction,
  MetaData,
  HandleData,
  RouterFactoryProps
} from '@/shared/router/types';
```
