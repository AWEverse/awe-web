/**
 * A global context reference optimized for Server-Side Rendering (SSR) environments.
 * Provides access to the global object in SSR contexts, with fallbacks for Node.js and minimal runtimes.
 *
 * @remarks
 * - Designed for SSR frameworks like Next.js, Nuxt.js, or custom Node.js servers.
 * - `global`: Available in Node.js-based SSR environments.
 * - Fallback: Provides an SSR-specific mock object with minimal properties to avoid runtime errors.
 * - Avoids browser-specific globals (`window`, `self`) since they are undefined during SSR.
 * - Compatible with `globalThis` for modern runtimes (ES2020+).
 *
 * Use this utility when:
 * - Rendering components or logic on the server.
 * - Ensuring compatibility with Node.js-based SSR setups.
 * - Avoiding errors from accessing unavailable browser globals.
 */
const globalContext = (() => {
  // Modern environments (ES2020+) support `globalThis`, including Node.js-based SSR
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }

  // Node.js environment (common in SSR setups like Next.js or custom servers)
  if (typeof global !== "undefined") {
    return global;
  }

  // Fallback for SSR environments with no detectable global object
  // Uses plain object for better performance compared to Object.create(null)
  return {
    isSSR: true,
    process: {
      env: { NODE_ENV: process?.env?.NODE_ENV || "production" },
      platform: "server",
    },
    ssrContext: {},
  } as SSRContext;
})();

/**
 * The type definition for the SSR-optimized global context.
 * Represents the global object in SSR environments with type safety.
 *
 * @remarks
 * - `typeof globalThis`: For modern runtimes supporting `globalThis`.
 * - `NodeJS.Global`: For Node.js-based SSR environments.
 * - `SSRContext`: Custom type for the SSR fallback object.
 * - Avoids browser-specific types (`Window`, `WorkerGlobalScope`) since they don’t apply in SSR.
 */
interface SSRContext {
  isSSR: boolean;
  process: {
    env: { NODE_ENV?: string };
    platform: string;
  };
  ssrContext: Record<string, unknown>; // Flexible for framework-specific context
}

export type GlobalContext = typeof globalThis | SSRContext;

export default globalContext;

// Note: For large projects, consider adding a global.d.ts file with `declare global { interface Global { ... } }`
// for TypeScript declaration merging, enhancing IDE support and type safety.
