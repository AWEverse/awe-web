import { FC, ReactNode } from 'react';
import s from './ChapterChain.module.scss';

interface OwnProps {
  children: ReactNode;
}

const ChapterChainItem: FC<OwnProps> = () => {
  return (
    <article className={s.ChapterChainItem}>
      <img alt="" src="https://media.w3.org/2010/05/sintel/trailer.mp4" />
      <span>Chapter title</span>
    </article>
  );
};

export default ChapterChainItem;
