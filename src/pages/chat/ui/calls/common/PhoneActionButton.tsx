import ActionButton from '@/shared/ui/ActionButton';
import { CallOutlined } from '@mui/icons-material';
import { FC, ReactNode } from 'react';

import s from './PhoneActionButton.module.scss';

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const PhoneActionButton: FC<OwnProps & StateProps> = props => {
  const { children } = props;

  return (
    <div className={s.PhoneActionButton}>
      <ActionButton icon={<CallOutlined />} size="large" variant="rounded" />
      <span>{children}</span>
    </div>
  );
};

export default PhoneActionButton;
