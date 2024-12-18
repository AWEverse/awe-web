import { FC, memo } from 'react';

import s from './LastRequest.module.scss';

import { CloseRounded, HistoryRounded } from '@mui/icons-material';
import RippleEffect from '@/shared/ui/ripple-effect';
import buildClassName from '@/shared/lib/buildClassName';
import IconButton from '@/shared/ui/IconButton';

interface OwnProps {
  body?: string;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  tabIndex?: number;
  onClick?: () => void;
  onClose?: () => void;
}

const LastRequest: FC<OwnProps> = ({
  className,
  body = 'Last request is empy.',
  tabIndex = 0,
  onClick,
  onClose,
  active = false,
  disabled = false,
}) => {
  const classNames = buildClassName(
    s.LastRequest,
    className,
    active && !disabled && s.active,
    disabled && s.disabled,
  );

  return (
    <div role="button" tabIndex={tabIndex} onClick={onClick} className={classNames}>
      <HistoryRounded fontSize="small" />

      <p>{body}</p>

      <IconButton className={s.close} size="small" onClick={onClose} tabIndex={-1}>
        <CloseRounded fontSize="small" />
      </IconButton>

      <RippleEffect />
    </div>
  );
};

export default memo(LastRequest);
