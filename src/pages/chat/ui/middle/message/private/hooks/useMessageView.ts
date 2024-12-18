import { useMemo } from 'react';

enum ChatType {
  group = 'group',
  channel = 'channel',
  private = 'private',
}

interface Request {
  chatType: ChatType;
}

interface Responce {
  noAvatars?: boolean;
  noComments?: boolean;
  noSenderName?: boolean;
  noSenderAvatar?: boolean;
  noReplies?: boolean;
}

const settings: Record<ChatType, Responce> = {
  [ChatType.group]: {
    noAvatars: false,
    noComments: false,
    noSenderName: true,
    noReplies: true,
  },
  [ChatType.channel]: {
    noAvatars: false,
    noComments: true,
    noSenderName: false,
  },
  [ChatType.private]: {
    noAvatars: true,
    noComments: true,
    noSenderName: true,
  },
};

export default function useMessageView(props: Request): Responce {
  const { chatType } = props;

  return useMemo(() => settings[chatType] || {}, [chatType]);
}
