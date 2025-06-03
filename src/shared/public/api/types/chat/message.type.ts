import { ApiSticker, ApiCustomEmoji, ApiGif } from "../common.type";
import { ApiUserInfo } from "../user.type";
import { ApiMessageType } from "./enum.type";

export interface ApiMessageInfo {
  id: bigint;
  chatId: bigint;
  senderId: bigint;
  content: Buffer; // Зашифрованный контент
  header: Buffer;  // Метаданные сообщения
  messageType: ApiMessageType;
  flags: number;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
  replyToId?: bigint;
  forwardedFromId?: bigint;
  threadId?: bigint;
  replyDepth: number;
  sender: ApiUserInfo;
  replyTo?: ApiMessageInfo;
  forwardedFrom?: ApiMessageInfo;
  attachments?: ApiMessageAttachment[];
  reactions?: ApiMessageReaction[];
}

export interface ApiMessageList {
  messages: ApiMessageInfo[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: string;
  prevOffset?: string;
  lastMessageId?: bigint;
  firstMessageId?: bigint;
  type: ApiMessageType;
}

export interface ApiMessageAttachment {
  id: bigint;
  messageId: bigint;
  fileName: string;
  mimeType: string;
  fileHash: string;
  fileKey: string;
  fileIV: string;
  fileSize: number;
  fileType: string;
  thumbnail?: string;
  description?: string;
  url: string;
  createdAt: Date;
}

export interface ApiMessageReaction {
  id: bigint;
  messageId: bigint;
  userId: bigint;
  reaction: string;
  createdAt: Date;
  user?: ApiUserInfo;
}

export interface ApiMessageThread {
  id: bigint;
  chatId: bigint;
  creatorId: bigint;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  flags: number;
}

export interface ApiMessageSticker {
  id: bigint;
  messageId: bigint;
  stickerId: bigint;
  message: ApiMessageInfo;
  sticker: ApiSticker;
}

export interface ApiMessageEmoji {
  id: bigint;
  messageId: bigint;
  emojiId: bigint;
  message: ApiMessageInfo;
  emoji: ApiCustomEmoji;
}

export interface ApiMessageGif {
  id: bigint;
  messageId: bigint;
  gifId: bigint;
  message: ApiMessageInfo;
  gif: ApiGif;
}

