import { FC, memo } from 'react';
import s from './HeaderSection.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import { CloseRounded, EditRounded } from '@mui/icons-material';
import useChatStore from '@/pages/chat/store/useChatSelector';
import ActionButton from '@/shared/ui/ActionButton';

interface OwnProps {
  className?: string;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  name?: string;
}

const HeaderSection: FC<OwnProps> = ({ className, startDecorator, endDecorator, name = 'Andrii Volynets' }) => {
  const classNames = buildClassName(s.HeaderSection, className);
  const handleClose = useChatStore(state => state.closeProfileColumn);
  const handleOpen = useChatStore(state => state.openProfileEditing);

  return (
    <section className={classNames}>
      {startDecorator}
      <ActionButton icon={<CloseRounded />} size={'medium'} onClick={handleClose} />
      <h1 className={s.Heading}>{name}</h1>
      <ActionButton icon={<EditRounded />} size={'medium'} onClick={handleOpen} />
      {endDecorator}
    </section>
  );
};

export default memo(HeaderSection);
