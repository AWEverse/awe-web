import s from './SettingsScreen.module.scss';
import SettingsNavigation from './settings/SettingsNavigation';
import { SettingsScreenType } from './settings/types';

import AccountSetting from './settings/AccountSetting';
import ChatsSetting from './settings/ChatsSetting';
import ConfidenceSetting from './settings/ConfidenceSetting';
import InteractionSetting from './settings/InteractionSetting';
import NotificationsSetting from './settings/NotificationsSetting';
import PersonalizationSetting from './settings/PersonalizationSetting';

import { forwardRef } from 'react';
import buildClassName from '@/shared/lib/buildClassName';
import createSliderFactory from '@/lib/modules/slider-factory';

interface OwnProps {
  className?: string;
}
const screens = {
  [SettingsScreenType.SettingsNavigation]: SettingsNavigation,
  [SettingsScreenType.Account]: AccountSetting,
  [SettingsScreenType.Chats]: ChatsSetting,
  [SettingsScreenType.Confidence]: ConfidenceSetting,
  [SettingsScreenType.Interaction]: InteractionSetting,
  [SettingsScreenType.Notifications]: NotificationsSetting,
  [SettingsScreenType.Personalization]: PersonalizationSetting,
};

const SettingsScreenFactory = createSliderFactory({
  initialScreen: SettingsScreenType.SettingsNavigation,
  screens,
  rightClassNames: 'rightToLeft',
  leftClassNames: 'leftToRight',
});

const SettingsScreen = forwardRef<HTMLDivElement, OwnProps>((props, ref) => {
  const { className } = props;

  return (
    <section ref={ref} aria-label="Settings">
      <SettingsScreenFactory className={buildClassName(s.SliderColumn, className)} />
    </section>
  );
});

export default SettingsScreen;
