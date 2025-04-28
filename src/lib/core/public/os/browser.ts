import { requestMutation } from '@/lib/modules/fastdom';
import { PLATFORM_ENV_NORMALIZED } from './platform';

const BROWSER_PATTERNS = [
  { key: 'edg/', browser: 'Microsoft Edge' },           // Chromium-based Edge
  { key: 'opr/', browser: 'Opera' },                   // Chromium-based Opera
  { key: 'opera', browser: 'Opera Legacy' },           // Legacy Opera (fallback)
  { key: 'chrome/', browser: 'Google Chrome' },        // Chromium-based Chrome
  { key: 'safari/', browser: 'Safari' },               // Safari
  { key: 'firefox/', browser: 'Mozilla Firefox' },     // Firefox
  { key: 'trident/', browser: 'Internet Explorer' },   // IE (modern)
  { key: 'msie', browser: 'Internet Explorer Legacy' },// IE (older versions)
  { key: 'ucbrowser', browser: 'UC Browser' },         // UC Browser
  { key: 'samsungbrowser', browser: 'Samsung Internet' }, // Samsung Internet
  { key: 'qqbrowser', browser: 'QQ Browser' },         // QQ Browser
];

/**
 * Detects the browser using a single-pass, C-like efficient parsing of userAgent.
 * @returns {string | undefined} The detected browser name or undefined if unrecognized.
 */
export function getBrowser(): string | undefined {
  const ua = navigator.userAgent.toLowerCase();

  let matchedBrowser: string | undefined;
  let isChromeBased = false;
  let isOpera = false;

  for (let i = 0, len = BROWSER_PATTERNS.length; i < len; i++) {
    const { key, browser } = BROWSER_PATTERNS[i];

    if (ua.includes(key)) {
      if (key === 'chrome/') {
        isChromeBased = true;
        matchedBrowser = browser; // Tentative match, refine later
      } else if (key === 'edg/') {
        return browser; // Edge takes precedence
      } else if (key === 'opr/') {
        isOpera = true;
        matchedBrowser = browser; // Opera Chromium
      } else if (key === 'opera' && !isChromeBased) {
        matchedBrowser = browser; // Legacy Opera only if no Chrome
      } else if (key === 'safari/' && !isChromeBased) {
        matchedBrowser = browser; // Safari only if no Chrome
      } else if (key === 'trident/' || key === 'msie') {
        // IE version check
        if ((key === 'msie' && (ua.includes('msie 6') || ua.includes('msie 7'))) || key === 'trident/') {
          matchedBrowser = key === 'trident/' ? 'Internet Explorer' : 'Internet Explorer Legacy';
        }
        return matchedBrowser;
      } else {
        return browser; // Direct match for other browsers (UC, Samsung, QQ)
      }
    }
  }

  if (isChromeBased && !isOpera && matchedBrowser === 'Google Chrome') {
    return 'Google Chrome';
  }

  if (!matchedBrowser) {
    if ('InstallTrigger' in window) {
      return 'Mozilla Firefox';
    }
    if ("chrome" in window && !ua.includes('edg/') && !ua.includes('opr/')) {
      return 'Google Chrome';
    }
  }

  return matchedBrowser || undefined;
}

/**
 * Normalizes a browser name for use in class names.
 * @param browser - The browser name to normalize.
 * @returns Normalized browser name (e.g., "google-chrome") or empty string if undefined.
 */
function normalizeBrowserName(browser: string | undefined): string {
  return browser?.toLowerCase().replace(/\s+/g, '-') || '';
}

/**
 * Applies platform and browser classes to the document body using fastdom.
 * @param platform - The platform class name (e.g., from PLATFORM_ENV_NORMALIZED).
 * @param browser - The browser name to apply as a class.
 */
function applyBrowserClasses(platform: string | undefined, browser: string | undefined): void {
  const normalizedPlatform = platform || '';
  const normalizedBrowser = normalizeBrowserName(browser);

  const classList = document.body.classList;
  if (normalizedPlatform) {
    classList.remove(normalizedPlatform);
    classList.add(normalizedPlatform);
  }
  if (normalizedBrowser) {
    classList.remove(normalizedBrowser);
    classList.add(normalizedBrowser);
  }
}

// Export and apply browser environment
export const BROWSER_ENV = getBrowser();
applyBrowserClasses(PLATFORM_ENV_NORMALIZED, BROWSER_ENV);
