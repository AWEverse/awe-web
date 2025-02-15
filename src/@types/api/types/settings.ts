type ApiStage = 'Alpha' | 'Beta' | 'Production';

export interface ApiLanguage {
  official?: true;
  rtl?: true;
  stage?: ApiStage;
  name: string;
  nativeName: string;
  langCode: string;
  baseLangCode?: string;
  pluralCode: string;
  stringsCount: number;
  translatedCount: number;
  translationsUrl: string;
}

export type ApiLangString =
  | string
  | {
      zeroValue?: string;
      oneValue?: string;
      twoValue?: string;
      fewValue?: string;
      manyValue?: string;
      otherValue?: string;
    };

export type ApiLangPack = Record<string, ApiLangString | undefined>;
