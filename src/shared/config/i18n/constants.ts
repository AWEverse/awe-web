export const LOCALES = {
  GERMAN: 'de',
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
  POLISH: 'pl',
  RUSSIAN: 'ru',
  UKRANIAN: 'uk',
  CHINESE: 'zh',
};

export const LOCALE_LABELS = {
  [LOCALES.GERMAN]: 'Deutsch',
  [LOCALES.ENGLISH]: 'English',
  [LOCALES.SPANISH]: 'Español',
  [LOCALES.FRENCH]: 'Français',
  [LOCALES.POLISH]: 'Polski',
  [LOCALES.RUSSIAN]: 'Русский',
  [LOCALES.UKRANIAN]: 'Українська',
  [LOCALES.CHINESE]: '简体中文',
};

export const DEFAULT_LOCALE = LOCALES.ENGLISH;

export const PHONE_PATTERN = {
  [LOCALES.ENGLISH]: /^[+]?(\d{1,3})?[-.\s]?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})$/, // США, Канада (формат: +1-XXX-XXX-XXXX)
  [LOCALES.GERMAN]: /^[+]?49[-.\s]?(\d{3,4})[-.\s]?(\d{3,4})[-.\s]?(\d{3,4})$/, // Германия (формат: +49 XXXX XXX XXX)
  [LOCALES.POLISH]: /^[+]?48[-.\s]?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{3})$/, // Польша (формат: +48 XXX XXX XXX)
  [LOCALES.RUSSIAN]: /^[+]?7[-.\s]?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{2})[-.\s]?(\d{2})$/, // Россия (формат: +7 XXX XXX XX XX)
  [LOCALES.UKRANIAN]: /^[+]?380[-.\s]?(\d{2})[-.\s]?(\d{3})[-.\s]?(\d{2})[-.\s]?(\d{2})$/, // Украина (формат: +380 XX XXX XX XX)
  [LOCALES.CHINESE]: /^[+]?86[-.\s]?(\d{3})[-.\s]?(\d{4})[-.\s]?(\d{4})$/, // Китай (формат: +86 XXX XXXX XXXX)
  [LOCALES.SPANISH]: /^[+]?34[-.\s]?(\d{3})[-.\s]?(\d{2})[-.\s]?(\d{2})[-.\s]?(\d{2})$/, // Испания (формат: +34 XXX XX XX XX)
  [LOCALES.FRENCH]: /^[+]?33[-.\s]?(\d{1})[-.\s]?(\d{2})[-.\s]?(\d{2})[-.\s]?(\d{2})[-.\s]?(\d{2})$/, // Франция (формат: +33 X XX XX XX XX)
};
