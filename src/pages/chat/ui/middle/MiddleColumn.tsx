import { ChatProps, ChatType } from '@/shared/types';
import { FC, useState, memo } from 'react';
import { chats } from '../../api/data';
import ChatLayout from './layout/ChatLayout';
import MiddleHeader from './widgets/MiddleHeader';
import MessagesBackdrop from './placeholder/MessagesBackdrop';
import MiddleMessageList from './widgets/MiddleMessageList/MiddleMessageList';
import MiddleInput from './widgets/MiddleInput';
import EmptyChat from './placeholder/EmptyChat';
import s from './MiddleColumn.module.scss';

interface OwnProps {}

interface StateProps {}

const MiddleColumn: FC<OwnProps & StateProps> = () => {
  const [selectedChat] = useState<ChatProps>(chats[1]);

  return (
    <ChatLayout.MainContainer>
      <MiddleHeader sender={selectedChat.sender} />
      <MessagesBackdrop />
      <EmptyChat className={s.EmptyChats} />
      {/* <MiddleMessageList />
      <MiddleInput /> */}
    </ChatLayout.MainContainer>
  );
};

export default memo(MiddleColumn);
