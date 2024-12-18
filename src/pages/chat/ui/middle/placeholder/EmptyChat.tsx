import { FC } from 'react';
import Placeholder from './Placeholder';
import s from './EmptyChat.module.scss';

const { Root, Header, Content } = Placeholder;

interface OwnProps {
  username?: string;
  className?: string;
}

const isUsername = (username?: string) => username && username.length > 0;

const EmptyChat: FC<OwnProps> = ({ username, className }) => {
  return (
    <Root className={className}>
      <Header title={`Welcome to Chat${isUsername(username) ? ` with ${username}` : '!'}`}>
        <p>It's time to start a new conversation!</p>
      </Header>
      <Content
        className={s.CustomContent}
        emojiLabel="Thinking emoji"
        emojiSymbol="🤔"
        message="Who knows, maybe this is your best, but you’re just too shy to write... It's okay, just write 🙂"
      >
        <blockquote>
          "A journey of a thousand words begins with literally only two 'Oh, Hi🙂'."
        </blockquote>
      </Content>
    </Root>
  );
};

export default EmptyChat;
