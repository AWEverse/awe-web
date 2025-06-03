import React, { memo } from "react";
import { useTranslation } from "react-i18next";

// Define types
type ManipulationFn = (value: string) => string;
type ComponentsMap = Record<string, React.ReactNode>;

interface I18nProps {
  i18nKey: string;
  manipulations?: ManipulationFn;
  components?: ComponentsMap;
}

const EMPTY_COMPONENTS: ComponentsMap = {};

/**
 * Internationalization component for handling translations
 * @param {string} i18nKey - The translation key
 * @param {ManipulationFn} [manipulations] - Optional string manipulation function
 * @param {ComponentsMap} [components] - Optional components for interpolation
 */
const I18n = memo<I18nProps>(
  ({ i18nKey, manipulations, components = EMPTY_COMPONENTS }) => {
    const { t: translate } = useTranslation();

    if (!i18nKey || typeof i18nKey !== "string") {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error: <I18n> requires a valid string i18nKey prop");
      }
      return null;
    }

    const translated = translate(i18nKey, { components });

    return <>{manipulations ? manipulations(translated) : translated}</>;
  },
);

I18n.displayName = "I18n";

export default I18n;
