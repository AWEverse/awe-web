import { ReactNode } from 'react';

export interface MessageReactionProps {
  icon: React.ReactNode;
  avatars: string[];
}

export interface ChildrenProps {
  children: React.ReactNode | string | number;
}

export interface MessageTimestampProps {
  timestamp: string;
}

export interface MessageCheckProps {
  isSent: boolean;
  isRead?: boolean;
}

export interface RepliedMessageType {
  text: string;
}

export type UserProps = {
  name: string;
  username: string;
  avatar: string;
  online: boolean;
};

type MessageVariants = 'video' | 'image' | 'file' | 'text';

export interface ImageType {
  url: string;
  name: string;
  alt?: string;
  type: string;
}

export type ReplyMessage = {
  id: string;
  replId: string;
  sender: UserProps | 'You';
  content: ReactNode;
  type: MessageVariants;
};

export type ThumbnailType = {
  url?: string;
  name: string;
};

export type MessageType = {
  id: string;
  answered?: ReplyMessage;
  thumbnail: ThumbnailType;
  content: ReactNode;
  timestamp: string;
  timeCache: number;
  unread?: boolean;
  type: MessageVariants;
  sender: UserProps | 'You';
  reactions: MessageReactionProps[];
};

export enum ChatType {
  private = 0x01, // Личный чат
  group = 0x02, // Групповой чат
  channel = 0x03, // Канал
  multiChannel = 0x04, // Мультиканал
  server = 0x05, // Сервер
  public = 0x06, // Публичный чат
  support = 0x07, // Чат поддержки
  chatbot = 0x08, // Чат-бот
  secret = 0x09, // Тайный чат
  voice = 0x0a, // Голосовой чат
  video = 0x0b, // Видеочат
  broadcast = 0x0c, // Бродкаст чат
  service = 0x0d, // Служебный чат
}

export interface MessageListProps {
  dateId: string;
  date: string;
  dateTimestamp: number;
  messages: MessageType[];
}

export type ChatProps = {
  id: string;
  sender: UserProps;
  chatType: ChatType;
  messages: MessageListProps[];
};

export interface MessageBubbleProps extends ChildrenProps {
  roundSide: string;
  answered?: ReactNode;
  isSent: boolean;
  onRightClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export enum MessageStatus {
  RECEIVED = 0,
  SEND = 1,
}

export interface MessageClippedTailContainerProps extends ChildrenProps {
  ref?: React.RefObject<HTMLDivElement>;
  isSent: boolean;
}

export interface MessageBubleProps extends ChildrenProps {}
