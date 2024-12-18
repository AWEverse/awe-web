import React from 'react';
import { MessageReactionProps } from '../../../shared/types';

export interface UserDetailsProps {
  userName: string;
  action: string;
}

export interface CommentProps {
  avatarSrc: string;
  userName: string;
  action: string;
  timeAgo: string;
  content: string | React.ReactNode;
  reactions?: MessageReactionProps[] | null;
  replies?: CommentProps[] | null;
  replyTo?: ReplyBodyProps;
}

export interface ReplyBodyProps {
  userName: string;
  content: string | React.ReactNode;
}
