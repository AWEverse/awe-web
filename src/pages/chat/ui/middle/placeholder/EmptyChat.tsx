import { FC } from 'react';
import Placeholder from './Placeholder';
import s from './EmptyChat.module.scss';

const { Root, Header, Content } = Placeholder;

interface OwnProps {
  username?: string;
  className?: string;
}

const isUsername = (username?: string) => username && username.length > 0;

const EmptyChat: FC<OwnProps> = ({ username = 'Альбінчік', className }) => {
  return (
    <Root className={className}>
      <Header title={`Welcome to Chat${isUsername(username) ? ` with ${username}` : '!'}`}>
        <p>It's time to start a new conversation!</p>
      </Header>
      <Content
        className={s.CustomContent}
        emojiLabel="Thinking emoji"
        emojiSymbol="🤔"
        message="Feeling a bit shy? No worries, just say 'Hi' 🙂 and let's get started!"
      >
        <section>
          <blockquote>"Every great conversation starts with a simple 'Hi 🙂'.</blockquote>
        </section>
      </Content>
    </Root>
  );
};

export default EmptyChat;
