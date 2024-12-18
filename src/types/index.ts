export type ThreadId = string | number;

export type LangCode =
  | 'en'
  | 'ar'
  | 'be'
  | 'ca'
  | 'nl'
  | 'fr'
  | 'de'
  | 'id'
  | 'it'
  | 'ko'
  | 'ms'
  | 'fa'
  | 'pl'
  | 'pt-br'
  | 'ru'
  | 'es'
  | 'tr'
  | 'uk'
  | 'uz';

export type TimeFormat = '24h' | '12h';

export type PrivacyVisibility = 'everybody' | 'contacts' | 'closeFriends' | 'nonContacts' | 'nobody';

export type Theme = 'dark' | 'light';

export interface ApiPrivacySettings {
  visibility: PrivacyVisibility;
  isUnspecified?: boolean;
  allowUserIds: string[];
  allowChatIds: string[];
  blockUserIds: string[];
  blockChatIds: string[];
  shouldAllowPremium?: true;
}
