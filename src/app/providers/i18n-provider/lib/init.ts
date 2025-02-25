import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEBUG } from '@/lib/config/dev';

const initI18n = async () => {
  try {
    await i18next
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        debug: DEBUG, // Only enable detailed logging in development

        // Supported languages and detection settings
        supportedLngs: ['en', 'de', 'fr'],
        nonExplicitSupportedLngs: true, // Allows "en" to match "en-US", etc.
        load: 'languageOnly',

        // Namespace configuration: helps organize translation files
        ns: ['common'],
        defaultNS: 'common',

        // Backend settings for loading translation files
        backend: {
          loadPath: 'locales/{{lng}}/{{ns}}.json',
        },

        // Language detection configuration
        detection: {
          order: [
            'querystring',
            'cookie',
            'localStorage',
            'navigator',
            'htmlTag',
            'path',
            'subdomain'
          ],
          caches: ['localStorage', 'cookie'],
          lookupQuerystring: 'lng',
          lookupCookie: 'i18next',
          lookupLocalStorage: 'i18nextLng',
          cookieOptions: { path: '/', sameSite: 'strict' },
        },

        // Interpolation configuration with a custom formatter
        interpolation: {
          escapeValue: false, // React already escapes values
          formatSeparator: ',',
          format: (value, format) => {
            if (format === 'uppercase' && typeof value === 'string') {
              return value.toUpperCase();
            }
            return value;
          },
        },

        // React-i18next specific options
        react: {
          useSuspense: true,
        },

        // Report missing keys in development only
        saveMissing: DEBUG,
        missingKeyHandler: (lng, ns, key, fallbackValue) => {
          console.warn(`[i18next] Missing translation key in ${lng} (${ns}): ${key}, use fallback: ${fallbackValue}`);
        },
      });
    console.log('i18next is ready...');
  } catch (err) {
    console.error('Error initializing i18next:', err);
  }
};

export default initI18n;
