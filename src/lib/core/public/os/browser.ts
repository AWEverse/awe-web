import { PLATFORM_ENV_NORMALIZED } from './platform';

export function getBrowser(): string | undefined {
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.includes('edg/')) {
    return 'Microsoft Edge';
  } else if (userAgent.includes('opr/') || userAgent.includes('opera')) {
    return 'Opera';
  } else if (userAgent.includes('chrome')) {
    return 'Google Chrome';
  } else if (userAgent.includes('safari')) {
    return 'Safari';
  } else if (userAgent.includes('firefox')) {
    return 'Mozilla Firefox';
  } else if (userAgent.includes('msie') || userAgent.includes('trident')) {
    return 'Internet Explorer';
  } else {
    return undefined;
  }
}

export const BROWSER_ENV = getBrowser();
const normalizedBrowser = BROWSER_ENV?.toLowerCase().replace(' ', '-');

document.body.classList.remove(PLATFORM_ENV_NORMALIZED || '', normalizedBrowser || '');
document.body.classList.add(PLATFORM_ENV_NORMALIZED || '', normalizedBrowser || '');
