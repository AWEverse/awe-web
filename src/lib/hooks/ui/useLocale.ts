import { useEffect, useState } from "react";
import i18next from "i18next";
import { useStableCallback } from "@/shared/hooks/base";

const SUPPORTED_LANGS = [
  "en",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pl",
  "pt",
  "ru",
  "sv",
  "uk",
  "zh",
];
const DEFAULT_LANG = "en";
const STORAGE_KEY = "i18nextLng";

function detectInitialLocale() {
  const stored =
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const navLang =
    typeof navigator !== "undefined" && navigator.language?.split("-")[0];
  if (navLang && SUPPORTED_LANGS.includes(navLang)) return navLang;
  return DEFAULT_LANG;
}

export function useLocale() {
  const [locale, setLocaleState] = useState(() => detectInitialLocale());

  useEffect(() => {
    if (i18next.language !== locale) {
      i18next.changeLanguage(locale);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);


  const setLocale = useStableCallback((lng: string) => {
    if (SUPPORTED_LANGS.includes(lng)) {
      setLocaleState(lng);
    }
  });

  return {
    locale,
    setLocale,
    supportedLocales: SUPPORTED_LANGS,
    isSupported: (lng: string) => SUPPORTED_LANGS.includes(lng),
  };
}

export default useLocale;
