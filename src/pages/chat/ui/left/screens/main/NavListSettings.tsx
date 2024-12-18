import DropdownMenu, { TriggerProps } from '@/shared/ui/DropdownMenu';
import { FC } from 'react';

interface OwnProps {
  trigger: FC<TriggerProps>;
}

const NavListSettings: FC<OwnProps> = props => {
  const { trigger } = props;

  return (
    <DropdownMenu position="top-right" triggerButton={trigger}>
      fssf
    </DropdownMenu>
  );
};

export default NavListSettings;
