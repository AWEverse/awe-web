import React, { memo } from "react";
import { useTranslation } from "react-i18next";

interface I18nProps {
  i18nKey: string;
  components?: Record<string, React.ReactNode>;
}

const I18n: React.FC<Readonly<I18nProps>> = ({ i18nKey, components = {} }) => {
  const { t: translation } = useTranslation();

  if (!i18nKey) {
    console.error("Error: <I18n> i18nKey prop not provided");
    return null;
  }

  return <>{translation(i18nKey, components)}</>;
};

export default memo(I18n);
