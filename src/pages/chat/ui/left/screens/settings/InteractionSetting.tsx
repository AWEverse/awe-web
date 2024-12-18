import { forwardRef } from 'react';
import { SettingsScreenType } from './types';
import ScreenTemplate from '../../common/ScreenTemplate';

interface OwnProps {
  className?: string;
  onScreenChange?: (screen: SettingsScreenType) => void;
}

const InteractionSetting = forwardRef<HTMLDivElement, OwnProps>((props, ref) => {
  const { className, onScreenChange } = props;

  return (
    <ScreenTemplate ref={ref} className={className} title="Interaction Settings" onScreenChange={onScreenChange}>
      {/* Place your specific content here */}
      <p>Interaction setting content goes here...</p>
    </ScreenTemplate>
  );
});

export default InteractionSetting;
