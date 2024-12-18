/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useContext, useRef } from 'react';
import { Avatar, Box, Stack, StackProps, Typography } from '@mui/material';
import { ChatProps, ChatType, MessageType } from '@/shared/types';
import Message from '@/entities/message';
import { TimeRead } from './TimeRead';
import useDetectSticky from '@/lib/hooks/sensors/useDetectSticky';
import useScrolling from '@/lib/hooks/sensors/useScrolling';

const ScrollingContext = React.createContext<boolean>(true);

const useScrollingContext = () => {
  return useContext(ScrollingContext);
};

type MessageGroupHeaderProps = {
  date: string;
};

type SenderAvatarProps = {
  avatar: string;
};

type MessageGroupProps = {
  messageGroup: MessageType[];
  chatType: ChatType;
};

const SenderAvatar: React.FC<SenderAvatarProps> = ({ avatar }) => (
  <Box
    sx={{
      display: 'flex',
      position: 'absolute',
      height: '100%',
      flexDirection: 'column-reverse',
      zIndex: 2,
    }}
  >
    <Avatar size="sm" src={avatar} sx={{ position: 'sticky', bottom: 0.1875 }} />
  </Box>
);

const MessageGroup = ({ messageGroup, chatType }: MessageGroupProps) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {chatType === ChatType.group && messageGroup[0].sender !== 'You' && (
        <SenderAvatar avatar={messageGroup[0].sender.avatar} />
      )}
      <Stack sx={{ gap: 0.25 }}>
        {messageGroup.map((message, mindex) => (
          <Message
            key={mindex}
            appearanceOrder={0}
            isFirstInDocumentGroup={false}
            isFirstInGroup={false}
            isJustAdded={false}
            isLastInDocumentGroup={false}
            isLastInGroup={false}
            isLastInList={false}
            memoFirstUnreadIdRef={{
              current: undefined,
            }}
            messageListType={'thread'}
            noComments={false}
            noReplies={false}
            observeIntersectionForBottom={function (
              target: HTMLElement,
              targetCallback?: (entry: IntersectionObserverEntry) => void,
            ): NoneToVoidFunction {
              throw new Error('Function not implemented.');
            }}
            observeIntersectionForLoading={function (
              target: HTMLElement,
              targetCallback?: (entry: IntersectionObserverEntry) => void,
            ): NoneToVoidFunction {
              throw new Error('Function not implemented.');
            }}
            observeIntersectionForPlaying={function (
              target: HTMLElement,
              targetCallback?: (entry: IntersectionObserverEntry) => void,
            ): NoneToVoidFunction {
              throw new Error('Function not implemented.');
            }}
            threadId={''}
            {...message}
          />
        ))}
      </Stack>
    </Box>
  );
};

interface DateLabelProps {
  date: string;
}

const DateLabel: React.FC<DateLabelProps> = ({ date }) => {
  const ref = useRef(null);
  const isScrolling = useScrollingContext();

  const [isSticky] = useDetectSticky(ref, {
    threshold: [1],
  });

  return (
    <>
      <Box
        ref={ref}
        sx={{
          position: 'absolute',
          width: '1px',
          height: '100%',
          top: '-0.26rem',
        }}
      ></Box>
      <Typography
        data-sticky={`${isSticky ? (isScrolling ? 'scrolling' : 'invisible') : 'visible'}`}
        level={'body-xs'}
        sx={{
          transition: 'all 300ms ease',
          color: 'text.primary',
          position: 'relative',
          backgroundColor: 'background.level2',
          border: 0.5,
          borderColor: 'background.level3',
          px: 0.5,
          width: 'fit-content',
          pb: 0.25,
          borderRadius: 'var(--Border-Radius)',

          transform: 'rotateX(90deg)',
          filter: 'invert(50%) hue-rotate(90deg)',
          transformOrigin: 'top',

          '&[data-sticky="scrolling"], &[data-sticky="visible"]': {
            transform: 'rotateX(0deg)',
            filter: 'invert(0) hue-rotate(0deg)',
          },
          '&[data-sticky="scrolling"]': {
            opacity: 0.75,
          },
          '&[data-sticky="visible"]': {
            opacity: 1,
          },
          '&[data-sticky="invisible"]': {
            opacity: 0.00001,
          },
        }}
      >
        {date}
      </Typography>
    </>
  );
};

const MessageGroupHeader: React.FC<MessageGroupHeaderProps> = ({ date }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        position: 'sticky',
        top: '-0.25rem',
        zIndex: 1,
        transition: 'all 250ms ease',
        mb: 0.5,
      }}
    >
      <DateLabel date={date} />
    </Box>
  );
};

interface ScrollingProps {
  children: React.ReactNode;
  id: string;
  sx?: StackProps['sx'];
}

const ChatScroller: React.FC<ScrollingProps & StackProps> = ({ children, id, sx }) => {
  const scrollRef = useRef(null);
  const scrolling = useScrolling(scrollRef, 1500);

  return (
    <ScrollingContext.Provider value={scrolling}>
      <Stack
        ref={scrollRef}
        id={id}
        sx={{
          overflow: 'auto',
          mt: 'auto',

          display: 'flex',
          flexDirection: 'column-reverse',
          position: 'relative',
          gap: 1,
          py: 1,
          ...sx,
        }}
      >
        <Stack>{children}</Stack>
      </Stack>
    </ScrollingContext.Provider>
  );
};

const ChatSection: React.FC<ChatProps & StackProps> = ({ id, sx, chatType, messages }) => {
  const MessageGroups = messages.map((group, gindex) => (
    <Stack key={gindex} sx={{ gap: 1 }}>
      <MessageGroupHeader date={group.date} />
      {group.messages
        .reduce((acc: MessageType[][], message, mindex) => {
          if (mindex === 0) {
            acc.push([message]);
          } else {
            const prevMessage = group.messages[mindex - 1];
            const isSameSender = message.sender === prevMessage.sender;
            const isWithinTimeLimit = message.timeCache - prevMessage.timeCache <= 120000;

            if (!isSameSender || !isWithinTimeLimit) {
              acc.push([message]);
            } else {
              acc[acc.length - 1].push(message);
            }
          }
          return acc;
        }, [])
        .map((messageGroup, index) => (
          <MessageGroup key={index} chatType={chatType} messageGroup={messageGroup} />
        ))}
      {group.messages[group.messages.length - 1].sender === 'You' && (
        <TimeRead isRead timestamp="5 min ago" />
      )}
    </Stack>
  ));

  return (
    <ChatScroller id={id} sx={sx}>
      {MessageGroups}
    </ChatScroller>
  );
};

export default memo(ChatSection);
