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
import { FC, ReactNode, useRef, useState } from "react";
import MessageText from "./views/MessageText";

import "./index.scss";

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

type OwnProps = {
  message: ApiMessage;
  observeIntersectionForBottom: ObserveFn;
  observeIntersectionForLoading: ObserveFn;
  observeIntersectionForPlaying: ObserveFn;
  album?: IAlbum;
  withAvatar?: boolean;
  withSenderName?: boolean;
  threadId: ThreadId;
  messageListType: MessageListType;
  noComments: boolean;
  noReplies: boolean;
  isJustAdded: boolean;
  memoFirstUnreadIdRef: { current: number | undefined };
  isOwn: boolean;
  getIsMessageListReady: () => boolean;
} & MessagePositionProperties;

interface StateProps {}

const ChatMessage: FC<OwnProps & StateProps> = ({
  message,
  observeIntersectionForBottom,
  observeIntersectionForLoading,
}) => {
  const { content, isJustAdded } = message;

  const messageRef = useRef<HTMLDivElement>(null);
  const bottomMarkerRef = useRef<HTMLDivElement>(null);

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

    return <div>Message content is {isLoading ? "visible" : "hidden"}</div>;
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
    observeIntersectionForBottom,
  );

  return (
    <div ref={messageRef} className="Message">
      {renderContent()}
      <div
        ref={bottomMarkerRef}
        className="Message__bottom"
        date-purpose={Purposes.READING}
        data-meta={NBSP}
      />
    </div>
  );
};

export default ChatMessage;
