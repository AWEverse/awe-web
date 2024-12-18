import { FC } from 'react';
import Placeholder from './Placeholder';
import s from './EmptyChat.module.scss';

const { Root, Header, Content } = Placeholder;

const PendingAcceptance: FC = () => {
  return (
    <Root>
      <Header title="Pending acceptance">
        <p>You have been invited to join the chat</p>
      </Header>
      <Content
        className={s.CustomContent}
        emojiLabel="Waiting emoji"
        emojiSymbol="⏳"
        message="Accept the invitation to start a conversation"
      >
        <p>Who knows, maybe they'll have the answer 😉</p>
      </Content>
    </Root>
  );
};

export default PendingAcceptance;
