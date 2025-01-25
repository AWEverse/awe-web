/**
 * A cross-environment context reference.
 * Returns the global `window` object in the browser, or `self` in web workers.
 *
 * @remarks
 * - The `window` object is available in browsers.
 * - The `self` object is available in web workers as a reference to the global context.
 *
 * This is useful when you need to access the global context in environments like
 * browsers, web workers, or even during SSR (server-side rendering) without causing issues.
 */
const globalContext = typeof window !== "undefined" ? window : self;

/**
 * The global context type.
 * This is useful when you need to access the global context in environments like
 * browsers, web workers, or even during SSR (server-side rendering) without causing issues.
 *
 * @remarks
 * - The `window` object is available in browsers.
 * - The `self` object is available in web workers as a reference to the global context.
 */
export type GlobalContext = typeof globalContext;

export default globalContext;
