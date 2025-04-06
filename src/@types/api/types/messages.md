# Condensed API Types

## Media Types
- **ApiDimensions**: `{ width: number, height: number }`
- **ApiPhoto**: `{ id: string, thumbnail?: ApiThumbnail, sizes: ApiPhotoSize[], videoSizes?: ApiVideoSize[], isVideo?: boolean }`
- **ApiSticker**: `{ id: string, setInfo: ApiStickerSetInfo, isLottie: boolean, isVideo: boolean }`
- **ApiVideo**: `{ id: string, mimeType: string, duration: number, fileName: string, size: number }`
- **ApiDocument**: `{ id: string, fileName: string, size: number, mimeType: string }`

## Message Content
- **ApiFormattedText**: `{ text: string, entities?: ApiMessageEntity[] }`
- **ApiMessageEntity**: `{ type: string, offset: number, length: number, [key: string]: any }`
- **MediaContent**: `{
  text?: ApiFormattedText,
  photo?: ApiPhoto,
  video?: ApiVideo,
  document?: ApiDocument,
  sticker?: ApiSticker,
  poll?: ApiPoll,
  action?: ApiAction
}`

## Core Message
- **ApiMessage**: `{
  id: number,
  chatId: string,
  content: MediaContent,
  date: number,
  isOutgoing: boolean,
  replyInfo?: ApiReplyInfo,
  forwardInfo?: ApiMessageForwardInfo
}`

## Reactions
- **ApiReaction**: `{ emoticon: string } | { documentId: string }`
- **ApiReactions**: `{ results: { reaction: ApiReaction, count: number }[] }`

## Interactive Elements
- **ApiPoll**: `{ id: string, question: string, answers: { text: string, option: string }[] }`
- **ApiKeyboardButton**: `{ type: string, text: string, [data: string]: any }`
- **ApiKeyboardButtons**: `ApiKeyboardButton[][]`

## Thread Info
- **ApiThreadInfo**: `{
  chatId: string,
  messagesCount: number,
  lastMessageId?: number,
  threadId: number
}`

## Constants
- **MAIN_THREAD_ID**: `-1`
- **MESSAGE_DELETED**: `'MESSAGE_DELETED'`
