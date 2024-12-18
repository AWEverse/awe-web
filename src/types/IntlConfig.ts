import { CustomFormats, MessageFormatElement } from 'react-intl';

type TemplateString<T> = string | T;

type RichTextContent<T> = TemplateString<T> | TemplateString<T>[];

type FormatRichTextElementFn<T, R = RichTextContent<T>> = (parts: Array<TemplateString<T>>) => R;

export interface LocaleConfiguration {
  locale: string;
  formats: CustomFormats;
  messages: Record<string, string> | Record<string, MessageFormatElement[]>;
  defaultLocale: string;
  defaultFormats: CustomFormats;
  timeZone?: string;
  textComponent?: React.ComponentType | keyof React.ReactHTML;
  wrapRichTextChunksInFragment?: boolean;
  defaultRichTextElements?: Record<string, FormatRichTextElementFn<React.ReactNode>>;
  onError(err: string): void;
}
