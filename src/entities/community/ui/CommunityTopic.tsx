import { ListProps } from '@mui/material';
import { Avatar } from '@mui/material';

import FlatList from '@/entities/FlatList';
import Linkify from '@/shared/ui/Linkify';

import Img from '@/shared/ui/img';

import s from './CommunityTopic.module.scss';

interface AvatarProps {
  avatars: string[];
}

interface TextSectionProps {
  categoryIcon: React.ReactNode;
  title?: string;
  question: string;
  author: string;
  topicName: string;
  categories: string[];
}

interface ItemProps {
  children?: React.ReactNode;
}

const AvatarSection: React.FC<AvatarProps> = ({ avatars }) => (
  <FlatList
    data={avatars}
    keyExtractor={(_, index) => `avatar-${index}`}
    renderItem={item => <Avatar className={s.avatar} src={item} />}
  />
);

const EndSection: React.FC<ItemProps> = ({ children }) => <div className={s.endSection}>{children}</div>;

const TextSection: React.FC<TextSectionProps> = ({ categoryIcon, question, title, author, topicName, categories }) => (
  <div className={s.textSection}>
    <Img
      alt=""
      caption={`${categoryIcon} ${title}`}
      captionClassName={s.imageCaption}
      className={s.image}
      src="https://m.media-amazon.com/images/I/61rwipF7RFL._AC_UF1000,1000_QL80_.jpg"
    />

    <p className={s.questionText}>{question}</p>

    <hr className={s.divider} />

    <span className={s.publisher}>
      <Linkify text={`${author} asked yesterday in ${topicName} usage category: ${categories.join(', ')}`} />
    </span>

    <div className={s.metaData} title="29 June 2024, 15:29:48 Edited: 29 June 2024, 15:34:23">
      <span className={s.viewsCount}>56.2K</span>&nbsp;
      <span className={s.viewsText}>&nbsp;просмотров</span>
      &nbsp;•&nbsp;
      <span className={s.time}>15:29</span>
    </div>
  </div>
);

const Item: React.FC<ItemProps> = ({ children }) => <li className={s.listItem}>{children}</li>;

const Root: React.FC<ListProps> = props => <ul {...props}>{props.children}</ul>;

export default {
  Root,
  Item,
  TextSection,
  AvatarSection,
  EndSection,
};
