import { useEffect, useState } from 'react';
import { TLangCode } from '@/shared/config/i18n/types';
import English from '@/shared/config/lang/en.json';

const useLocale = () => {
  const [locale, setLocale] = useState<TLangCode>('en');
  const [messages, setMessages] = useState(English);

  useEffect(() => {
    if (locale === 'en') {
      setMessages(English);
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

    loadMessages();
  }, [locale]);

  return { locale, setLocale, messages };
};

export default useLocale;
