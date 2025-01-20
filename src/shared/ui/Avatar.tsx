import { ApiChat } from "@/@types/api/types/chats";
import { ApiPhoto } from "@/@types/api/types/messages";
import { ApiUser } from "@/@types/api/types/user";
import AvatarStoryCircle from "@/entities/avatar-story-сircle";
import { ObserveFn } from "@/shared/hooks/DOM/useIntersectionObserver";
import { IS_TEST } from "@/lib/utils/OS/windowEnviroment";
import { useRef } from "react";

type OwnProps = {
  className?: string;
  peer?: ApiUser | ApiChat;
  size?: AvatarSize;
  photo?: ApiPhoto;
  text?: string;
  isSavedMessages?: boolean;
  isSavedDialog?: boolean;
  withVideo?: boolean;
  withStory?: boolean;
  forPremiumPromo?: boolean;
  withStoryGap?: boolean;
  withStorySolid?: boolean;
  forceFriendStorySolid?: boolean;
  forceUnreadStorySolid?: boolean;
  storyViewerMode?: "full" | "single-peer" | "disabled";
  loopIndefinitely?: boolean;
  noPersonalPhoto?: boolean;
  observeIntersection?: ObserveFn;
  onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    hasMedia: boolean,
  ) => void;
};

const LOOP_COUNT = 3;

export type AvatarSize =
  | "micro"
  | "tiny"
  | "mini"
  | "small"
  | "small-mobile"
  | "medium"
  | "large"
  | "giant"
  | "jumbo";

const Avatar = (props: OwnProps) => {
  const {
    className,
    peer,
    size = "medium",
    photo,
    text,
    isSavedMessages,
    isSavedDialog,
    withVideo,
    withStory,
    forPremiumPromo,
    withStoryGap,
    withStorySolid,
    forceFriendStorySolid,
    forceUnreadStorySolid,
    storyViewerMode,
    loopIndefinitely,
    noPersonalPhoto,
    observeIntersection,
    onClick,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const videoLoopCountRef = useRef(0);
  const isCustomPeer = peer && "isCustomPeer" in peer;
  const realPeer = peer && !isCustomPeer ? peer : undefined;
  const isPeerChat = realPeer && "title" in realPeer;
  const user = peer && !isPeerChat ? (peer as ApiUser) : undefined;
  const chat = peer && isPeerChat ? (peer as ApiChat) : undefined;

  const shouldLoadVideo = withVideo && photo?.isVideo;

  return (
    <div
      ref={ref}
      aria-label={typeof content === "string" ? author : undefined}
      className={fullClassName}
      data-peer-id={realPeer?.id}
      data-test-sender-id={IS_TEST ? realPeer?.id : undefined}
      id={
        realPeer?.id && withStory ? getPeerStoryHtmlId(realPeer.id) : undefined
      }
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <div className="inner">
        {typeof content === "string"
          ? renderText(content, [size === "jumbo" ? "hq_emoji" : "emoji"])
          : content}
      </div>
      {withStory && realPeer?.hasStories && (
        <AvatarStoryCircle
          peerId={realPeer.id}
          size={size}
          withExtraGap={withStoryGap}
        />
      )}
    </div>
  );
};
