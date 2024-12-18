import { forwardRef } from 'react';
import ScreenTemplate from '../../common/ScreenTemplate';
import { SettingsScreenType } from './types';

interface OwnProps {
  className?: string;
  onScreenChange?: (screen: SettingsScreenType) => void;
}

const PersonalizationSetting = forwardRef<HTMLDivElement, OwnProps>((props, ref) => {
  const { className, onScreenChange } = props;

  return (
    <ScreenTemplate ref={ref} className={className} title="Personalization Settings" onScreenChange={onScreenChange}>
      {/* Place your specific content here */}
      <p>Personalization setting content goes here...</p>
    </ScreenTemplate>
  );
});

export default PersonalizationSetting;
