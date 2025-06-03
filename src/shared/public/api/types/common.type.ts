import { ApiUserInfo } from "./user.type";

export interface ApiStickerPack {
  id: bigint;
  name: string;
  title: string;
  description?: string;
  authorId?: bigint;
  thumbnailUrl: string;
  flags: number;
  price: number;
  category?: string;
  tags?: string;
  downloadCount: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: ApiUserInfo;
  stickers: ApiSticker[];
}

export interface ApiSticker {
  id: bigint;
  packId: bigint;
  emoji: string;
  fileUrl: string;
  fileName: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  flags: number;
  usageCount: number;
  position: number;
  createdAt: Date;
}

export interface ApiCustomEmoji {
  id: bigint;
  chatId?: bigint;
  authorId: bigint;
  name: string;
  fileUrl: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  flags: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: ApiUserInfo;
}

export interface ApiGifCategory {
  id: bigint;
  name: string;
  description?: string;
  iconUrl?: string;
  flags: number;
  position: number;
  gifCount: number;
  createdAt: Date;
}

export interface ApiGif {
  id: bigint;
  categoryId: bigint;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  fileSize: number;
  duration?: number;
  tags?: string;
  searchText?: string;
  flags: number;
  usageCount: number;
  createdAt: Date;
  category: ApiGifCategory;
}
