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
import useStateSignal from "@/lib/hooks/signals/useStateSignal";
import { ApiChatType } from "@/shared/api";

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
  chatType: ApiChatType;
} & MessagePositionProperties;

interface StateProps {}

const ChatMessage: FC<OwnProps & StateProps> = ({ isOwn }) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const bottomMarkerRef = useRef<HTMLDivElement>(null);

  const {
    observeIntersectionForReading,
    observeIntersectionForLoading,
    observeIntersectionForPlaying,
  } = useScrollProvider();

  const renderContent = (): ReactNode => {
    return "content";
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
        data-ctx
        ref={messageRef}
        className={buildClassName("Message", isOwn ? "own" : "other")}
      >
        {renderContent()}
        <div
          ref={bottomMarkerRef}
          className="Message__bottom"
          date-purpose={Purposes.READING}
          data-meta={NBSP}
        />
        <svg
          viewBox="0 0 11 20"
          width="11"
          height="20"
          className={buildClassName("MessageTail", isOwn ? "own" : "other")}
          data-purpose="message-tail"
        >
          <use href="#message-tail-filled"></use>
        </svg>
      </div>
    </>
  );
};

export default memo(ChatMessage);
