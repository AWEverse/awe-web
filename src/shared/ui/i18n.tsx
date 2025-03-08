import React, { memo } from "react";
import { useTranslation } from "react-i18next";

interface I18nProps {
  children: string;
  components?: Record<string, React.ReactNode>;
}

const I18n: React.FC<Readonly<I18nProps>> = ({ children, components = {} }) => {
  const { t: translation } = useTranslation();

  if (!children) {
    console.error("Error: <I18n> i18nKey prop not provided");
    return null;
  }

  return <>{translation(children, components)}</>;
};

export default memo(I18n);
