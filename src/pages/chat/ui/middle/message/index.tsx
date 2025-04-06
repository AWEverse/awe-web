import {
  ApiMessage,
  IAlbum,
  MessageListType,
} from "@/@types/api/types/messages";
import {
  ObserveFn,
  useIsIntersecting,
  useOnIntersect,
} from "@/shared/hooks/DOM/useIntersectionObserver";
import { REM } from "@/lib/utils/mediaDimensions";
import { ThreadId } from "@/types";
import { FC, memo, ReactNode, useRef, useState } from "react";

import "./index.scss";
import { useScrollProvider } from "@/shared/context";
import MessageText from "./private/ui/views/MessageText";
import ContextMenu, { useContextMenuHandlers } from "@/entities/context-menu";
import { EMouseButton } from "@/lib/core";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import buildClassName from "@/shared/lib/buildClassName";

type PositionEntity = "Group" | "Document" | "List";
type Position = "IsFirst" | "IsLast";

type MessagePositionProperties = {
  [K in `${Position}${PositionEntity}`]: boolean;
};

type MetaPosition = "in-text" | "standalone" | "none";
type ReactionsPosition = "inside" | "outside" | "none";
type QuickReactionPosition = "in-content" | "in-meta";
type ReplyPosition = "in-content" | "in-meta" | "outside";

const NBSP = "\u00A0";
const ANIMATION_DURATION = 250;
const APPEARANCE_DELAY = 10;
const NO_MEDIA_CORNERS_THRESHOLD = 18;
const QUICK_REACTION_SIZE = 1.75 * REM;
const EXTRA_SPACE_FOR_REACTIONS = 2.25 * REM;
const BOTTOM_FOCUS_SCROLL_THRESHOLD = 5;
const THROTTLE_MS = 300;
const RESIZE_ANIMATION_DURATION = 400;

class Purposes {
  static readonly READING = "reading";
  static readonly PLAYING = "playing";
  static readonly LOADING = "loading";
}

export const MessageStatuses = [
  "delivered",
  "error",
  "paused",
  "partial-sent",
  "read",
  "sending",
  "sent",
  "viewed",
] as const;
export type MessageStatusType = (typeof MessageStatuses)[number];

export const Directions = ["incoming", "outgoing"] as const;
export type DirectionType = (typeof Directions)[number];

type OwnProps = {
  isOwn: boolean;
  message: ApiMessage;
  album?: IAlbum;
  withAvatar?: boolean;
  withSenderName?: boolean;
  threadId: ThreadId;
  messageListType: MessageListType;
  noComments: boolean;
  noReplies: boolean;
  isJustAdded: boolean;
  memoFirstUnreadIdRef: { current: number | undefined };
  accessibleList: () => boolean;
} & MessagePositionProperties;

interface StateProps {}

const markdownContent = `
# Hello there!

Welcome to the world of **Markdown**! 🌟 Here you can easily format text and add cool elements.

## Here's what you can do:
- **Bold text** for emphasis
- *Italic text* for subtle highlights
- [Click here](https://example.com) to visit our website
- Here's a list:
  - First item
  - Second item
  - Third item

> _“Markdown makes writing fun and easy!”_

## Code Example:
\`\`\`js
const message = "Hello, world!";
console.log(message);
\`\`\`

Stay awesome! ✨
`;

const ChatMessage: FC<OwnProps & StateProps> = ({ isOwn, message }) => {
  const { content, isJustAdded } = message;

  const messageRef = useRef<HTMLDivElement>(null);
  const bottomMarkerRef = useRef<HTMLDivElement>(null);

  const {
    observeIntersectionForReading,
    observeIntersectionForLoading,
    observeIntersectionForPlaying,
  } = useScrollProvider();

  const renderContent = (): ReactNode => {
    const {
      text,
      photo,
      video,
      altVideo,
      document,
      sticker,
      contact,
      poll,
      action,
      webPage,
      audio,
      voice,
      invoice,
      location,
      game,
      giveaway,
      giveawayResults,
      isExpiredVoice,
      isExpiredRoundVideo,
      ttlSeconds,
    } = content;

    return <MessageText children={markdownContent} />;
  };

  const renderAvatar = () => {
    return <div>Avatar</div>;
  };

  const renderTitle = () => {
    return <div>Title</div>;
  };

  const renderMessageText = () => {
    return <div>Text</div>;
  };

  const isLoading = useIsIntersecting(
    messageRef,
    observeIntersectionForLoading,
  );
  const isReading = useIsIntersecting(
    bottomMarkerRef,
    observeIntersectionForReading,
  );

  return (
    <>
      <div
        ref={messageRef}
        className={buildClassName("Message", isOwn && "own")}
      >
        {renderContent()}
        <div
          ref={bottomMarkerRef}
          className="Message__bottom"
          date-purpose={Purposes.READING}
          data-meta={NBSP}
        />
      </div>
    </>
  );
};

export default memo(ChatMessage);
