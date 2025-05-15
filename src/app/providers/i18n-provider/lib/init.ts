import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEBUG } from '@/lib/config/dev';

const initI18n = async () => {
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    await i18next
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        debug: DEBUG && !isProduction,

        supportedLngs: ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'sv', 'uk', 'zh'],
        nonExplicitSupportedLngs: true, // Allows "en" to match "en-US", etc.
        load: 'languageOnly',

        ns: ['common'],
        defaultNS: 'common',

        backend: {
          loadPath: isProduction
            ? '/locales/{{lng}}/{{ns}}.json'
            : 'locales/{{lng}}/{{ns}}.json',
        },

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

        interpolation: {
          escapeValue: false,
          formatSeparator: ',',
          format: (value, format) => {
            if (format === 'uppercase' && typeof value === 'string') {
              return value.toUpperCase();
            }
            return value;
          },
        },

        react: {
          useSuspense: true,
        },

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
