import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import English from '@/shared/config/lang/en.json';
import { TLangCode } from '@/shared/config/i18n/types';

interface OwnProps {
  children: React.ReactNode;
}

export const localesList = ['en', 'de', 'es', 'fr', 'pl', 'ru', 'ua', 'zh'] as TLangCode[];

const IntlLocaleProvider: React.FC<OwnProps> = ({ children }) => {
  const [locale, setLocale] = useState<TLangCode>('en');
  const [messages, setMessages] = useState(English);

  useEffect(() => {
    if (locale === 'en') {
      return;
    }

    async function loadMessages() {
      try {
        const loadedMessages = await import(`@/shared/config/lang/${locale}.json`);
        setMessages(loadedMessages.default);
      } catch (error) {
        console.error(`Error loading ${locale} translations, falling back to English.`, error);
        setMessages(English);
      }
    }

    loadMessages().then(console.log);
  }, [locale]);

  return (
    <IntlProvider defaultLocale="en" locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default IntlLocaleProvider;
