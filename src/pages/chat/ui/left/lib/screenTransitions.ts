import { LeftColumnScreenType } from "@/pages/chat/types/LeftColumn";

export type Screen = keyof typeof LeftColumnScreenType;

export const screenTransitions: Readonly<Record<Screen, readonly Screen[]>> = {
  Main: ['Archived', 'Contacts', 'SettingsNavigation'],
  Archived: ['Main', 'Contacts'],
  Contacts: ['Main', 'Archived', 'SettingsNavigation'],
  SettingsNavigation: [
    'Main',
    'AccountSetting',
    'ConfidenceSetting',
    'InteractionSetting',
    'NotificationsSetting',
    'PersonalizationSetting',
  ],
  AccountSetting: ['SettingsNavigation'],
  ConfidenceSetting: ['SettingsNavigation'],
  InteractionSetting: ['SettingsNavigation'],
  NotificationsSetting: ['SettingsNavigation'],
  PersonalizationSetting: ['SettingsNavigation'],
} as const;

/*
Tree-like representation of screen transitions:

Main
├── Archived
├── Contacts
└── SettingsNavigation
    ├── AccountSetting
    ├── ConfidenceSetting
    ├── InteractionSetting
    ├── NotificationsSetting
    └── PersonalizationSetting

Archived
├── Main
└── Contacts

Contacts
├── Main
├── Archived
└── SettingsNavigation
    ├── AccountSetting
    ├── ConfidenceSetting
    ├── InteractionSetting
    ├── NotificationsSetting
    └── PersonalizationSetting

SettingsNavigation
├── Main
├── AccountSetting
├── ConfidenceSetting
├── InteractionSetting
├── NotificationsSetting
└── PersonalizationSetting

AccountSetting
└── SettingsNavigation
    ├── Main
    ├── AccountSetting
    ├── ConfidenceSetting
    ├── InteractionSetting
    ├── NotificationsSetting
    └── PersonalizationSetting

ConfidenceSetting
└── SettingsNavigation
    ├── Main
    ├── AccountSetting
    ├── ConfidenceSetting
    ├── InteractionSetting
    ├── NotificationsSetting
    └── PersonalizationSetting

InteractionSetting
└── SettingsNavigation
    ├── Main
    ├── AccountSetting
    ├── ConfidenceSetting
    ├── InteractionSetting
    ├── NotificationsSetting
    └── PersonalizationSetting

NotificationsSetting
└── SettingsNavigation
    ├── Main
    ├── AccountSetting
    ├── ConfidenceSetting
    ├── InteractionSetting
    ├── NotificationsSetting
    └── PersonalizationSetting

PersonalizationSetting
└── SettingsNavigation
    ├── Main
    ├── AccountSetting
    ├── ConfidenceSetting
    ├── InteractionSetting
    ├── NotificationsSetting
    └── PersonalizationSetting
*/

const reverseTransitions: Readonly<Partial<Record<Screen, Screen>>> = (() => {
  const result: Partial<Record<Screen, Screen>> = {};
  for (const [from, toList] of Object.entries(screenTransitions) as [Screen, Screen[]][]) {
    for (const to of toList) {
      result[to] = from;
    }
  }
  return result;
})();

export function transition(a: Screen, b: Screen): Screen {
  if (screenTransitions[a].includes(b)) {
    return b;
  }
  throw new Error(`Invalid transition: ${a} -> ${b}`);
}

export function reverseTransition(a: Screen): Screen {
  const reverse = reverseTransitions[a];
  if (reverse) {
    return reverse;
  }
  throw new Error(`No reverse transition for ${a}`);
}
