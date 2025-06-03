import { ApiChatInfo } from "./chat.type";

export interface ApiChatFolder {
  id: bigint;
  userId: bigint;
  name: string;
  emoji?: string;
  position: number;
  flags: number;
  createdAt: Date;
  updatedAt: Date;
  items: ApiChatFolderItem[];
}

export interface ApiChatFolderItem {
  id: bigint;
  folderId: bigint;
  chatId: bigint;
  position: number;
  addedAt: Date;
  chat: ApiChatInfo;
}
