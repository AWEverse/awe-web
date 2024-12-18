// useGroupedMessages.ts
import { useEffect, useState } from 'react';
import { MessageType } from '@/shared/types';

const useGroupedMessages = (messages: MessageType[]) => {
  const [groupedMessages, setGroupedMessages] = useState<MessageType[][]>([]);

  useEffect(() => {
    setGroupedMessages(
      messages.reduce((acc: MessageType[][], message, mindex) => {
        if (mindex === 0) {
          acc.push([message]);
        } else {
          const prevMessage = messages[mindex - 1];
          const isSameSender = message.sender === prevMessage.sender;
          const timeDiff = message.timeCache - prevMessage.timeCache;
          const isWithinTimeLimit = timeDiff <= 120000;

          if (!isSameSender || !isWithinTimeLimit) {
            acc.push([message]);
          } else {
            acc[acc.length - 1].push(message);
          }
        }
        return acc;
      }, []),
    );
  }, [messages]);

  return groupedMessages;
};

export default useGroupedMessages;
