import { useEffect, useState } from "react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
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

if (!i18next.services.languageDetector) {
  i18next.use(LanguageDetector);
}

function detectInitialLocale() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  // Use i18next's detection if available
  const detected = i18next.services.languageDetector?.detect?.();
  if (detected && SUPPORTED_LANGS.includes(detected)) return detected;
  // Fallback to navigator
  const navLang = navigator.language?.split("-")[0];
  if (navLang && SUPPORTED_LANGS.includes(navLang)) return navLang;
  return DEFAULT_LANG;
}

export function useLocale() {
  const [locale, setLocaleState] = useState(() => detectInitialLocale());

  useEffect(() => {
    if (i18next.language !== locale) {
      i18next.changeLanguage(locale).catch(() => { });
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  useEffect(() => {
    const handler = (lng: string) => {
      if (lng && lng !== locale && SUPPORTED_LANGS.includes(lng)) {
        setLocaleState(lng);
      }
    };
    i18next.on("languageChanged", handler);
    return () => {
      i18next.off("languageChanged", handler);
    };
  }, [locale]);

  const setLocale = useStableCallback((lng: string) => {
    if (SUPPORTED_LANGS.includes(lng) && lng !== locale) {
      setLocaleState(lng);
    }
  });

  const isSupported = useStableCallback(
    (lng: string) => SUPPORTED_LANGS.includes(lng)
  );

  return {
    locale,
    setLocale,
    supportedLocales: SUPPORTED_LANGS,
    isSupported,
  };
}

export default useLocale;
