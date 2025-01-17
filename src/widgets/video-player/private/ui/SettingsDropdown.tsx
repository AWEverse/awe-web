import ActionButton from '@/shared/ui/ActionButton';
import DropdownMenu, { TriggerProps } from '@/shared/ui/DropdownMenu';

import { FC, memo } from 'react';

import s from './SettingsDropdown.module.scss';

interface OwnProps<T extends Record<string, unknown> = {}> {
  triggerButton: FC<T & TriggerProps>;
}

const SettingsDropdown: FC<OwnProps> = ({ triggerButton }) => {
  const renderAnnotation = (text: string) => {
    return (
      <span className={s.annotation}>
        <span className={s.annotationText}>{text}</span>
      </span>
    );
  };

  return (
    <DropdownMenu triggerButton={triggerButton} position="bottom-right">
      <ActionButton>Stable volume</ActionButton>
      <ActionButton>Ambient Mode</ActionButton>
      <ActionButton>Playback speed</ActionButton>
      <ActionButton>Speed timer</ActionButton>
      <ActionButton endDecorator={renderAnnotation('Auto (1080p) >')}>Quality</ActionButton>
    </DropdownMenu>
  );
};

export default memo(SettingsDropdown);
