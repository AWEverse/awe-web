import { ThreadId } from '@/types';
import { ApiChat } from './chats';

export interface ApiDimensions {
  width: number;
  height: number;
}

export interface ApiPhotoSize extends ApiDimensions {
  type: 's' | 'm' | 'x' | 'y' | 'z';
}

export interface ApiVideoSize extends ApiDimensions {
  type: 'u' | 'v';
  videoStartTs: number;
  size: number;
}

export interface ApiThumbnail extends ApiDimensions {
  dataUri: string;
}

export interface ApiPhoto {
  id: string;
  thumbnail?: ApiThumbnail;
  isVideo?: boolean;
  sizes: ApiPhotoSize[];
  videoSizes?: ApiVideoSize[];
  blobUrl?: string;
  isSpoiler?: boolean;
}

export interface ApiSticker {
  id: string;
  stickerSetInfo: ApiStickerSetInfo;
  emoji?: string;
  isCustomEmoji?: boolean;
  isLottie: boolean;
  isVideo: boolean;
  width?: number;
  height?: number;
  thumbnail?: ApiThumbnail;
  isPreloadedGlobally?: boolean;
  hasEffect?: boolean;
  isFree?: boolean;
  shouldUseTextColor?: boolean;
}

export interface ApiStickerSet {
  isArchived?: true;
  isLottie?: true;
  isVideos?: true;
  isEmoji?: true;
  installedDate?: number;
  id: string;
  accessHash: string;
  title: string;
  hasThumbnail?: boolean;
  thumbCustomEmojiId?: string;
  count: number;
  stickers?: ApiSticker[];
  packs?: Record<string, ApiSticker[]>;
  covers?: ApiSticker[];
  shortName: string;
}

type ApiStickerSetInfoShortName = {
  shortName: string;
};

type ApiStickerSetInfoId = {
  id: string;
  accessHash: string;
};

type ApiStickerSetInfoMissing = {
  isMissing: true;
};

export type ApiStickerSetInfo =
  | ApiStickerSetInfoShortName
  | ApiStickerSetInfoId
  | ApiStickerSetInfoMissing;

export interface ApiVideo {
  id: string;
  mimeType: string;
  duration: number;
  fileName: string;
  width?: number;
  height?: number;
  supportsStreaming?: boolean;
  isRound?: boolean;
  isGif?: boolean;
  isSpoiler?: boolean;
  thumbnail?: ApiThumbnail;
  blobUrl?: string;
  previewBlobUrl?: string;
  size: number;
  noSound?: boolean;
}

export interface ApiAudio {
  id: string;
  size: number;
  mimeType: string;
  fileName: string;
  duration: number;
  performer?: string;
  title?: string;
  thumbnailSizes?: ApiPhotoSize[];
}

export interface ApiVoice {
  id: string;
  duration: number;
  waveform?: number[];
}

export interface ApiDocument {
  id?: string;
  fileName: string;
  size: number;
  timestamp?: number;
  mimeType: string;
  thumbnail?: ApiThumbnail;
  previewBlobUrl?: string;
  mediaType?: 'photo' | 'video';
  mediaSize?: ApiDimensions;
}

export interface ApiContact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userId: string;
}

export interface ApiPollAnswer {
  text: string;
  option: string;
}

export interface ApiPollResult {
  isChosen?: true;
  isCorrect?: true;
  option: string;
  votersCount: number;
}

export interface ApiPoll {
  id: string;
  summary: {
    closed?: true;
    isPublic?: true;
    multipleChoice?: true;
    quiz?: true;
    question: string;
    answers: ApiPollAnswer[];
    closePeriod?: number;
    closeDate?: number;
  };
  results: {
    isMin?: true;
    results?: ApiPollResult[];
    totalVoters?: number;
    recentVoterIds?: string[];
    solution?: string;
    solutionEntities?: ApiMessageEntity[];
  };
}

// First type used for state, second - for API requests
export type ApiInputInvoice =
  | {
      chatId: string;
      messageId: number;
      isExtendedMedia?: boolean;
    }
  | {
      slug: string;
    };

export type ApiRequestInputInvoice =
  | {
      chat: ApiChat;
      messageId: number;
    }
  | {
      slug: string;
    };

export interface ApiInvoice {
  text: string;
  title: string;
  //   photo?: ApiWebDocument;
  amount: number;
  currency: string;
  receiptMsgId?: number;
  isTest?: boolean;
  isRecurring?: boolean;
  termsUrl?: string;
  extendedMedia?: ApiMessageExtendedMediaPreview;
  maxTipAmount?: number;
  suggestedTipAmounts?: number[];
}

export interface ApiMessageExtendedMediaPreview {
  width?: number;
  height?: number;
  thumbnail?: ApiThumbnail;
  duration?: number;
}

export interface ApiPaymentCredentials {
  id: string;
  title: string;
}

export interface ApiGeoPoint {
  long: number;
  lat: number;
  accessHash: string;
  accuracyRadius?: number;
}

interface ApiGeo {
  type: 'geo';
  geo: ApiGeoPoint;
}

interface ApiVenue {
  type: 'venue';
  geo: ApiGeoPoint;
  title: string;
  address: string;
  provider: string;
  venueId: string;
  venueType: string;
}

interface ApiGeoLive {
  type: 'geoLive';
  geo: ApiGeoPoint;
  heading?: number;
  period: number;
}

export type ApiLocation = ApiGeo | ApiVenue | ApiGeoLive;

export type ApiGame = {
  title: string;
  description: string;
  photo?: ApiPhoto;
  shortName: string;
  id: string;
  accessHash: string;
  document?: ApiDocument;
};

export type ApiGiveaway = {
  quantity: number;
  months: number;
  untilDate: number;
  isOnlyForNewSubscribers?: true;
  countries?: string[];
  channelIds: string[];
  prizeDescription?: string;
};

export type ApiGiveawayResults = {
  months: number;
  untilDate: number;
  isRefunded?: true;
  isOnlyForNewSubscribers?: true;
  channelId: string;
  prizeDescription?: string;
  winnersCount?: number;
  winnerIds: string[];
  additionalPeersCount?: number;
  launchMessageId: number;
  unclaimedCount: number;
};

export type ApiNewPoll = {
  summary: ApiPoll['summary'];
  quiz?: {
    correctAnswers: string[];
    solution?: string;
    solutionEntities?: ApiMessageEntity[];
  };
};

export interface ApiAction {
  text: string;
  targetUserIds?: string[];
  targetChatId?: string;
  type:
    | 'historyClear'
    | 'contactSignUp'
    | 'chatCreate'
    | 'topicCreate'
    | 'suggestProfilePhoto'
    | 'joinedChannel'
    | 'chatBoost'
    | 'other';
  photo?: ApiPhoto;
  amount?: number;
  currency?: string;
  giftCryptoInfo?: {
    currency: string;
    amount: string;
  };
  translationValues: string[];
  //   call?: Partial<ApiGroupCall>;
  //   phoneCall?: PhoneCallAction;
  score?: number;
  months?: number;
  topicEmojiIconId?: string;
  isTopicAction?: boolean;
  slug?: string;
  isGiveaway?: boolean;
  isUnclaimed?: boolean;
  pluralValue?: number;
}

export interface ApiWebPage {
  id: number;
  url: string;
  displayUrl: string;
  type?: string;
  siteName?: string;
  title?: string;
  description?: string;
  photo?: ApiPhoto;
  audio?: ApiAudio;
  duration?: number;
  document?: ApiDocument;
  video?: ApiVideo;
  //   story?: ApiWebPageStoryData;
}

export interface ApiSponsoredWebPage {
  url: string;
  siteName: string;
  photo?: ApiPhoto;
}

export type ApiReplyInfo = ApiMessageReplyInfo | ApiStoryReplyInfo;

export interface ApiMessageReplyInfo {
  type: 'message';
  replyToMsgId?: number;
  replyToPeerId?: string;
  replyFrom?: ApiMessageForwardInfo;
  replyMedia?: MediaContent;
  replyToTopId?: number;
  isForumTopic?: true;
  isQuote?: true;
  quoteText?: ApiFormattedText;
}

export interface ApiStoryReplyInfo {
  type: 'story';
  peerId: string;
  storyId: number;
}

export interface ApiInputMessageReplyInfo {
  type: 'message';
  replyToMsgId: number;
  replyToTopId?: number;
  replyToPeerId?: string;
  quoteText?: ApiFormattedText;
}

export interface ApiInputStoryReplyInfo {
  type: 'story';
  peerId: string;
  storyId: number;
}

export type ApiInputReplyInfo = ApiInputMessageReplyInfo | ApiInputStoryReplyInfo;

export interface ApiMessageForwardInfo {
  date: number;
  savedDate?: number;
  isImported?: boolean;
  isChannelPost: boolean;
  isLinkedChannelPost?: boolean;
  channelPostId?: number;
  fromChatId?: string;
  fromId?: string;
  savedFromPeerId?: string;
  fromMessageId?: number;
  hiddenUserName?: string;
  postAuthorTitle?: string;
}

export interface ApiStoryForwardInfo {
  fromPeerId?: string;
  fromName?: string;
  storyId?: number;
  isModified?: boolean;
}

export enum ApiMessageEntityTypes {
  Bold = 'Bold',
  Blockquote = 'Blockquote',
  BotCommand = 'BotCommand',
  Cashtag = 'Cashtag',
  Code = 'Code',
  Email = 'Email',
  Hashtag = 'Hashtag',
  Italic = 'Italic',
  MentionName = 'MentionName',
  Mention = 'Mention',
  Phone = 'Phone',
  Pre = 'Pre',
  Strike = 'Strike',
  TextUrl = 'TextUrl',
  Url = 'Url',
  Underline = 'Underline',
  Spoiler = 'Spoiler',
  CustomEmoji = 'CustomEmoji',
  Unknown = 'Unknown',
}

interface ApiMessageEntityBase {
  type: ApiMessageEntityTypes;
  offset: number;
  length: number;
}

export type ApiMessageEntityDefault = ApiMessageEntityBase & {
  type: Exclude<
    ApiMessageEntityTypes,
    | ApiMessageEntityTypes.Pre
    | ApiMessageEntityTypes.TextUrl
    | ApiMessageEntityTypes.MentionName
    | ApiMessageEntityTypes.CustomEmoji
  >;
};

export type ApiMessageEntityGeneric<T extends ApiMessageEntityTypes> = ApiMessageEntityBase & {
  type: T;
};

export type ApiMessageEntityPre = ApiMessageEntityBase & {
  type: ApiMessageEntityTypes.Pre;
  language?: string;
};

export type ApiMessageEntityTextUrl = ApiMessageEntityBase & {
  type: ApiMessageEntityTypes.TextUrl;
  url: string;
};

export type ApiMessageEntityMentionName = ApiMessageEntityBase & {
  type: ApiMessageEntityTypes.MentionName;
  userId: string;
};

export type ApiMessageEntityCustomEmoji = ApiMessageEntityBase & {
  type: ApiMessageEntityTypes.CustomEmoji;
  documentId: string;
};

export type ApiMessageEntity =
  | ApiMessageEntityDefault
  | ApiMessageEntityPre
  | ApiMessageEntityTextUrl
  | ApiMessageEntityMentionName
  | ApiMessageEntityCustomEmoji;

export interface ApiFormattedText {
  text: string;
  entities?: ApiMessageEntity[];
}

export type MediaContent = {
  text?: ApiFormattedText;
  photo?: ApiPhoto;
  video?: ApiVideo;
  altVideo?: ApiVideo;
  document?: ApiDocument;
  sticker?: ApiSticker;
  contact?: ApiContact;
  poll?: ApiPoll;
  action?: ApiAction;
  webPage?: ApiWebPage;
  audio?: ApiAudio;
  voice?: ApiVoice;
  invoice?: ApiInvoice;
  location?: ApiLocation;
  game?: ApiGame;
  //storyData?: ApiMessageStoryData;
  giveaway?: ApiGiveaway;
  giveawayResults?: ApiGiveawayResults;
  isExpiredVoice?: boolean;
  isExpiredRoundVideo?: boolean;
  ttlSeconds?: number;
};

export interface MessageSendingState {
  state: 'messageSendingStatePending' | 'messageSendingStateFailed';
}

export interface ApiMessage {
  id: number;
  chatId: string;
  content: MediaContent;
  date: number;
  editDate?: number;
  emojiOnlyCount?: number;
  forwardInfo?: ApiMessageForwardInfo;
  forwardsCount?: number;
  groupedId?: string;
  hasComments?: boolean;
  hasUnreadMention?: boolean;
  inlineButtons?: ApiKeyboardButtons;
  isDeleting?: boolean;
  isEdited?: boolean;
  isInAlbum?: boolean;
  isFromScheduled?: boolean;
  isHideKeyboardSelective?: boolean;
  isKeyboardSelective?: boolean;
  isKeyboardSingleUse?: boolean;
  isMediaUnread?: boolean;
  isMentioned?: boolean;
  isOutgoing: boolean;
  isPinned?: boolean;
  isProtected?: boolean;
  isScheduled?: boolean;
  isSilent?: boolean;
  isTranscriptionError?: boolean;
  isForwardingAllowed?: boolean;
  keyboardButtons?: ApiKeyboardButtons;
  keyboardPlaceholder?: string;
  postAuthorTitle?: string;
  previousLocalId?: number;
  reactions?: ApiReactions;
  readDate?: number;
  reactors?: {
    nextOffset?: string;
    count: number;
    reactions: ApiPeerReaction[];
  };
  replyInfo?: ApiReplyInfo;
  savedPeerId?: string;
  seenByDates?: Record<string, number>;
  senderBoosts?: number;
  senderId?: string;
  sendingState?: MessageSendingState;
  shouldHideKeyboardButtons?: boolean;
  transcriptionId?: string;
  viaBotId?: string;
  viewsCount?: number;
}

export interface ApiReactions {
  canSeeList?: boolean;
  areTags?: boolean;
  results: ApiReactionCount[];
  recentReactions?: ApiPeerReaction[];
}

export interface ApiPeerReaction {
  peerId: string;
  reaction: ApiReaction;
  isOwn?: boolean;
  isBig?: boolean;
  isUnread?: boolean;
  addedDate: number;
}

export interface ApiReactionCount {
  chosenOrder?: number;
  count: number;
  reaction: ApiReaction;
}

export interface ApiAvailableReaction {
  selectAnimation?: ApiDocument;
  appearAnimation?: ApiDocument;
  activateAnimation?: ApiDocument;
  effectAnimation?: ApiDocument;
  staticIcon?: ApiDocument;
  centerIcon?: ApiDocument;
  aroundAnimation?: ApiDocument;
  reaction: ApiReactionEmoji;
  title: string;
  isInactive?: boolean;
  isPremium?: boolean;
}

type ApiChatReactionsAll = {
  type: 'all';
  areCustomAllowed?: true;
};

type ApiChatReactionsSome = {
  type: 'some';
  allowed: ApiReaction[];
};

export type ApiChatReactions = ApiChatReactionsAll | ApiChatReactionsSome;

export type ApiReactionEmoji = {
  emoticon: string;
};

export type ApiReactionCustomEmoji = {
  documentId: string;
};

export type ApiReaction = ApiReactionEmoji | ApiReactionCustomEmoji;

export type ApiReactionKey = `${string}-${string}`;

export type ApiSavedReactionTag = {
  reaction: ApiReaction;
  title?: string;
  count: number;
};

interface ApiBaseThreadInfo {
  chatId: string;
  messagesCount: number;
  lastMessageId?: number;
  lastReadInboxMessageId?: number;
  recentReplierIds?: string[];
}

export interface ApiCommentsInfo extends ApiBaseThreadInfo {
  isCommentsInfo: true;
  threadId?: ThreadId;
  originChannelId: string;
  originMessageId: number;
}

export interface ApiMessageThreadInfo extends ApiBaseThreadInfo {
  isCommentsInfo: false;
  threadId: ThreadId;
  // For linked messages in discussion
  fromChannelId?: string;
  fromMessageId?: number;
}

export type ApiThreadInfo = ApiCommentsInfo | ApiMessageThreadInfo;

export type ApiMessageOutgoingStatus = 'read' | 'succeeded' | 'pending' | 'failed';

export interface IAlbum {
  albumId: string;
  messages: ApiMessage[];
  mainMessage: ApiMessage;
  captionMessage?: ApiMessage;
  hasMultipleCaptions: boolean;
  commentsMessage?: ApiMessage;
}

export type MessageListType = 'thread' | 'pinned' | 'scheduled';

export type ApiSponsoredMessage = {
  chatId?: string;
  randomId: string;
  isRecommended?: boolean;
  isAvatarShown?: boolean;
  isBot?: boolean;
  channelPostId?: number;
  startParam?: string;
  chatInviteHash?: string;
  chatInviteTitle?: string;
  text: ApiFormattedText;
  webPage?: ApiSponsoredWebPage;
  expiresAt: number;
  sponsorInfo?: string;
  additionalInfo?: string;
  buttonText?: string;
  botApp?: ApiBotApp;
};
interface ApiKeyboardButtonBase {
  type: string;
  text: string;
}

interface ApiKeyboardButtonSimple extends ApiKeyboardButtonBase {
  type: 'unsupported' | 'buy' | 'command' | 'requestPhone' | 'game';
}

interface ApiKeyboardButtonReceipt extends ApiKeyboardButtonBase {
  type: 'receipt';
  receiptMessageId: number;
}

interface ApiKeyboardButtonUrl extends ApiKeyboardButtonBase {
  type: 'url';
  url: string;
}

interface ApiKeyboardButtonSimpleWebView extends ApiKeyboardButtonBase {
  type: 'simpleWebView';
  url: string;
}

interface ApiKeyboardButtonWebView extends ApiKeyboardButtonBase {
  type: 'webView';
  url: string;
}

interface ApiKeyboardButtonCallback extends ApiKeyboardButtonBase {
  type: 'callback';
  data: string;
}

interface ApiKeyboardButtonRequestPoll extends ApiKeyboardButtonBase {
  type: 'requestPoll';
  isQuiz?: boolean;
}

interface ApiKeyboardButtonSwitchBotInline extends ApiKeyboardButtonBase {
  type: 'switchBotInline';
  query: string;
  isSamePeer?: boolean;
}

interface ApiKeyboardButtonUserProfile extends ApiKeyboardButtonBase {
  type: 'userProfile';
  userId: string;
}

interface ApiKeyboardButtonUrlAuth extends ApiKeyboardButtonBase {
  type: 'urlAuth';
  url: string;
  buttonId: number;
}

export type ApiTranscription = {
  text: string;
  isPending?: boolean;
  transcriptionId: string;
};

export type ApiKeyboardButton =
  | ApiKeyboardButtonSimple
  | ApiKeyboardButtonReceipt
  | ApiKeyboardButtonUrl
  | ApiKeyboardButtonCallback
  | ApiKeyboardButtonRequestPoll
  | ApiKeyboardButtonSwitchBotInline
  | ApiKeyboardButtonUserProfile
  | ApiKeyboardButtonWebView
  | ApiKeyboardButtonSimpleWebView
  | ApiKeyboardButtonUrlAuth;

export type ApiKeyboardButtons = ApiKeyboardButton[][];
export type ApiReplyKeyboard = {
  keyboardPlaceholder?: string;
  isKeyboardSingleUse?: boolean;
  isKeyboardSelective?: boolean;
} & {
  [K in 'inlineButtons' | 'keyboardButtons']?: ApiKeyboardButtons;
};

export type ApiMessageSearchType =
  | 'text'
  | 'media'
  | 'documents'
  | 'links'
  | 'audio'
  | 'voice'
  | 'profilePhoto';

export type ApiGlobalMessageSearchType =
  | 'text'
  | 'media'
  | 'documents'
  | 'links'
  | 'audio'
  | 'voice';

export type ApiReportReason =
  | 'spam'
  | 'violence'
  | 'pornography'
  | 'childAbuse'
  | 'copyright'
  | 'geoIrrelevant'
  | 'fake'
  | 'illegalDrugs'
  | 'personalDetails'
  | 'propaganda'
  | 'spamBot'
  | 'terrorism'
  | 'other';

/**
 * Represents the level of threat in a report.
 * Low: Minor or negligible threat.
 * Medium: Moderate threat that requires attention by moderators or anything.
 * High: Significant or severe threat that needs immediate action by moderators and admins/owners.
 */
export type ApiReportLevels = 'low' | 'medium' | 'high';

export type ApiSendMessageAction = {
  type: 'cancel' | 'typing' | 'recordAudio' | 'chooseSticker' | 'playingGame';
};

export type ApiThemeParameters = {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color: string;
  accent_text_color: string;
  section_bg_color: string;
  section_header_text_color: string;
  subtitle_text_color: string;
  destructive_text_color: string;
};

export type ApiBotApp = {
  id: string;
  accessHash: string;
  title: string;
  shortName: string;
  description: string;
  photo?: ApiPhoto;
  document?: ApiDocument;
};

export type ApiMessagesBotApp = ApiBotApp & {
  isInactive?: boolean;
  shouldRequestWriteAccess?: boolean;
};

export const MAIN_THREAD_ID = -1;

// `Symbol` can not be transferred from worker
export const MESSAGE_DELETED = 'MESSAGE_DELETED';
