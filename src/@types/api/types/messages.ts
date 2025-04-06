// Base Types
interface ApiDimensions {
  width: number;
  height: number;
}

interface ApiThumbnail extends ApiDimensions {
  dataUri: string;
}

interface ApiPhotoSize extends ApiDimensions {
  type: 's' | 'm' | 'x' | 'y' | 'z';
}

interface ApiVideoSize extends ApiDimensions {
  type: 'u' | 'v';
  videoStartTs: number;
  size: number;
}

// Media Types
interface ApiPhoto {
  id: string;
  thumbnail?: ApiThumbnail;
  sizes: ApiPhotoSize[];
  videoSizes?: ApiVideoSize[];
  isVideo?: boolean;
}

interface ApiStickerSetInfo {
  shortName?: string;
  id?: string;
  accessHash?: string;
  isMissing?: true;
}

interface ApiSticker {
  id: string;
  setInfo: ApiStickerSetInfo;
  isLottie: boolean;
  isVideo: boolean;
}

interface ApiVideo {
  id: string;
  mimeType: string;
  duration: number;
  fileName: string;
  size: number;
}

interface ApiDocument {
  id: string;
  fileName: string;
  size: number;
  mimeType: string;
}

// Message Content
interface ApiFormattedText {
  text: string;
  entities?: ApiMessageEntity[];
}

interface ApiMessageEntity {
  type: string;
  offset: number;
  length: number;
  [key: string]: any; // For additional properties like url, documentId, etc.
}

interface ApiPollAnswer {
  text: string;
  option: string;
}

interface ApiPoll {
  id: string;
  question: string;
  answers: ApiPollAnswer[];
}

interface ApiAction {
  text: string;
  type: string;
}

interface MediaContent {
  text?: ApiFormattedText;
  photo?: ApiPhoto;
  video?: ApiVideo;
  document?: ApiDocument;
  sticker?: ApiSticker;
  poll?: ApiPoll;
  action?: ApiAction;
}

// Reply and Forward Info
interface ApiMessageReplyInfo {
  type: 'message';
  replyToMsgId?: number;
}

interface ApiStoryReplyInfo {
  type: 'story';
  peerId: string;
  storyId: number;
}

type ApiReplyInfo = ApiMessageReplyInfo | ApiStoryReplyInfo;

interface ApiMessageForwardInfo {
  date: number;
  fromChatId?: string;
  fromId?: string;
}

interface ApiMessage {
  id: number;
  chatId: string;
  content: MediaContent;
  date: number;
  isOutgoing: boolean;
  replyInfo?: ApiReplyInfo;
  forwardInfo?: ApiMessageForwardInfo;
}

type ApiReaction = { emoticon: string } | { documentId: string };

interface ApiReactionCount {
  reaction: ApiReaction;
  count: number;
}

interface ApiReactions {
  results: ApiReactionCount[];
}

interface ApiKeyboardButton {
  type: string;
  text: string;
  [data: string]: any;
}

type ApiKeyboardButtons = ApiKeyboardButton[][];

interface ApiThreadInfo {
  chatId: string;
  messagesCount: number;
  lastMessageId?: number;
  threadId: number;
}

// Constants
const MAIN_THREAD_ID = -1;
const MESSAGE_DELETED = 'MESSAGE_DELETED';

export {
  MAIN_THREAD_ID,
  MESSAGE_DELETED
};

export type {
  ApiDimensions,
  ApiThumbnail,
  ApiPhotoSize,
  ApiVideoSize,
  ApiPhoto,
  ApiStickerSetInfo,
  ApiSticker,
  ApiVideo,
  ApiDocument,
  ApiFormattedText,
  ApiMessageEntity,
  ApiPollAnswer,
  ApiPoll,
  ApiAction,
  MediaContent,
  ApiMessageReplyInfo,
  ApiStoryReplyInfo,
  ApiReplyInfo,
  ApiMessageForwardInfo,
  ApiMessage,
  ApiReaction,
  ApiReactionCount,
  ApiReactions,
  ApiKeyboardButton,
  ApiKeyboardButtons,
  ApiThreadInfo
};
