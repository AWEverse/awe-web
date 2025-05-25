import { ApiUserInfo } from "../user.type";
import { ApiChatType, ApiChatRole } from "./enum.type";

export interface ApiChatInfo {
  id: bigint;
  type: ApiChatType;
  title?: string;
  description?: string;
  avatarUrl?: string;
  flags: number;
  memberCount: number;
  lastMessageAt?: Date;
  lastMessageText?: string;
  createdAt: Date;
  createdBy: ApiUserInfo;
}

export interface ApiChatParticipantInfo {
  id: bigint;
  chatId: bigint;
  userId: bigint;
  role: ApiChatRole;
  flags: number;
  joinedAt: Date;
  leftAt?: Date;
  mutedUntil?: Date;
  user: ApiUserInfo;
}

export interface ApiChatSettings {
  id: bigint;
  chatId: bigint;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
