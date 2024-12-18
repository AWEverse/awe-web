import { FC, ReactNode } from 'react';
import s from './LinkEntity.module.scss';

interface OwnProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  title?: string;
}

interface StateProps {}

const LinkEntity: FC<OwnProps & StateProps> = props => {
  const { children, href = '#', onClick, target, rel, title } = props;

  return (
    <a className={s.EntityLink} href={href} rel={rel} target={target} title={title} onClick={onClick}>
      {children}
    </a>
  );
};

export default LinkEntity;
