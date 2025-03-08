import { requestMutation } from '@/lib/modules/fastdom';
import { PLATFORM_ENV_NORMALIZED } from './platform';

/**
 * Detects the browser based on the user agent string.
 * Prioritizes modern browsers and returns undefined for unsupported cases.
 * @returns {string | undefined} The detected browser name or undefined if not recognized.
 */
export function getBrowser(): string | undefined {
  const userAgentString = window.navigator.userAgent.toLowerCase();
  const tokens = {
    edg: userAgentString.indexOf("edg/") > -1,
    opr: userAgentString.indexOf("opr/") > -1,
    opera: userAgentString.indexOf("opera") > -1,
    chrome: userAgentString.indexOf("chrome") > -1,
    safari: userAgentString.indexOf("safari") > -1,
    firefox: userAgentString.indexOf("firefox") > -1,
  };

  if (tokens.edg) {
    return 'Microsoft Edge'; // Chromium-based Edge
  }
  if (tokens.opr) {
    return 'Opera'; // Chromium-based Opera
  }
  // For Chrome, ensure it's not Edge or Opera masquerading as Chrome
  if (tokens.chrome && !tokens.edg && !tokens.opr) {
    return 'Google Chrome';
  }
  // Safari's user agent typically doesn't include "chrome"
  if (tokens.safari && !tokens.chrome) {
    return 'Safari';
  }
  if (tokens.firefox) {
    return 'Mozilla Firefox';
  }
  // Fallback for legacy Opera detection
  if (tokens.opera) {
    return 'Opera';
  }
  return undefined;
}


/**
 * Normalizes a browser name for use in class names.
 * @param {string | undefined} browser - The browser name to normalize.
 * @returns {string} Normalized browser name (e.g., "google-chrome") or empty string if undefined.
 */
function normalizeBrowserName(browser: string | undefined): string {
  return browser?.toLowerCase().replace(/\s+/g, '-') || '';
}

/**
 * Applies platform and browser classes to the document body.
 * @param {string | undefined} platform - The platform class name (e.g., from PLATFORM_ENV_NORMALIZED).
 * @param {string | undefined} browser - The browser name to apply as a class.
 */
function applyBrowserClasses(platform: string | undefined, browser: string | undefined): void {
  const normalizedPlatform = platform || '';
  const normalizedBrowser = normalizeBrowserName(browser);

  document.body.classList.remove(normalizedPlatform, normalizedBrowser);
  document.body.classList.add(normalizedPlatform, normalizedBrowser);

}

export const BROWSER_ENV = getBrowser();
applyBrowserClasses(PLATFORM_ENV_NORMALIZED, BROWSER_ENV);
