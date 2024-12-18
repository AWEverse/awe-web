import { ArrowBack } from '@mui/icons-material';
import { FC, memo, ReactNode } from 'react';
import s from './HeaderNavigation.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import IconButton from '@/shared/ui/IconButton';

interface OwnProps {
  children?: ReactNode;
  className?: string;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  name?: string;
  onPrevClick?: NoneToVoidFunction;
}

const HeaderNavigation: FC<OwnProps> = ({ children, className, startDecorator, name, endDecorator, onPrevClick }) => {
  return (
    <section className={buildClassName(s.HeaderSection, className)}>
      {startDecorator}
      <IconButton size="medium" onClick={onPrevClick}>
        <ArrowBack />
      </IconButton>
      <h1 className={s.Heading}>{name}</h1>
      <p className={s.ActionContainer}>{children}</p>
      {endDecorator}
    </section>
  );
};

export default memo(HeaderNavigation);
