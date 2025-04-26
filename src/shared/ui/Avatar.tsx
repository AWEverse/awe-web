import React, { useRef, useEffect, useState, useMemo } from "react";
import { ApiChat } from "@/@types/api/types/chats";
import { ApiPhoto } from "@/@types/api/types/messages";
import { ApiUser } from "@/@types/api/types/user";
import AvatarStoryCircle from "@/entities/avatar-story-сircle";
import { ObserveFn } from "@/shared/hooks/DOM/useIntersectionObserver";
import buildClassName from "../lib/buildClassName";

import "./Avatar.scss";

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
  customContent?: React.ReactNode;
  imageUrl?: string; // Allow direct image URL for custom cases
  badge?: React.ReactNode; // Optional badge component (like status indicator)
  fallbackLetter?: boolean; // Use first letter of name as fallback
};

const LOOP_COUNT = 3;
const IS_TEST = process.env.NODE_ENV === "test";

const Avatar: React.FC<OwnProps> = (props) => {
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
    customContent,
    imageUrl,
    badge,
    fallbackLetter,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoLoopCountRef = useRef(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isCustomPeer = peer && "isCustomPeer" in peer;
  const realPeer = peer && !isCustomPeer ? peer : undefined;
  const isPeerChat = realPeer && "title" in realPeer;
  const user = peer && !isPeerChat ? (peer as ApiUser) : undefined;
  const chat = peer && isPeerChat ? (peer as ApiChat) : undefined;

  const shouldLoadVideo = withVideo && photo?.isVideo;
  const hasMedia = Boolean(photo || imageUrl);

  const peerName = useMemo(() => {
    if (isSavedMessages) return "Saved Messages";
    if (isSavedDialog) return "Saved Dialog";
    if (text) return text;
    if (user) return user.firstName || user.lastName || "User";
    if (chat) return chat.title || "Chat";
    return "";
  }, [isSavedMessages, isSavedDialog, text, user, chat]);

  useEffect(() => {
    if (observeIntersection && ref.current) {
      const callback = (entry: IntersectionObserverEntry) => {
        setIsIntersecting(entry.isIntersecting);
      };

      observeIntersection(ref.current, callback);
    }
  }, [observeIntersection]);

  useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current || !isIntersecting) return;

    const video = videoRef.current;

    const handleVideoEnded = () => {
      if (loopIndefinitely) {
        video.play().catch(() => {});
        return;
      }

      videoLoopCountRef.current += 1;
      if (videoLoopCountRef.current < LOOP_COUNT) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener("ended", handleVideoEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("ended", handleVideoEnded);
      video.pause();
      videoLoopCountRef.current = 0;
    };
  }, [shouldLoadVideo, isIntersecting, loopIndefinitely]);

  // Handle click events
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (onClick) {
      onClick(e, hasMedia);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Prevent text selection
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  // Determine content to display
  const content = useMemo(() => {
    if (customContent) return customContent;

    if (isSavedMessages) {
      return (
        <div className="saved-messages-icon">
          <i className="icon-bookmark" />
        </div>
      );
    }

    if (isSavedDialog) {
      return (
        <div className="saved-dialog-icon">
          <i className="icon-archive" />
        </div>
      );
    }

    if (shouldLoadVideo && isIntersecting) {
      return (
        <video
          ref={videoRef}
          className="avatar-video"
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          src={photo?.thumbnail?.dataUri}
        />
      );
    }

    if (photo || imageUrl) {
      return (
        <img
          className={buildClassName("avatar-image", { loaded: isImageLoaded })}
          src={imageUrl || photo?.thumbnail?.dataUri}
          alt={peerName}
          onLoad={() => setIsImageLoaded(true)}
        />
      );
    }

    if (fallbackLetter && peerName) {
      return peerName.charAt(0).toUpperCase();
    }

    return peerName;
  }, [
    customContent,
    isSavedMessages,
    isSavedDialog,
    shouldLoadVideo,
    isIntersecting,
    photo,
    imageUrl,
    peerName,
    fallbackLetter,
    isImageLoaded,
  ]);

  const fullClassName = buildClassName("Avatar", `size-${size}`, className, {
    "with-story": withStory && realPeer?.hasStories,
    "with-video": shouldLoadVideo,
    "is-saved-messages": isSavedMessages,
    "is-saved-dialog": isSavedDialog,
    "for-premium-promo": forPremiumPromo,
    "with-story-gap": withStoryGap,
    "with-story-solid": withStorySolid,
    "force-friend-story-solid": forceFriendStorySolid,
    "force-unread-story-solid": forceUnreadStorySolid,
    "has-media": hasMedia,
    "media-loaded": isVideoLoaded || isImageLoaded,
    "no-personal-photo": noPersonalPhoto,
  });

  function renderText(content: string, classNames: string[]): React.ReactNode {
    // If content contains emoji, wrap them in a span for styling, else just return text
    // For simplicity, just wrap the content in a span with the given classNames
    return <span className={buildClassName(classNames)}>{content}</span>;
  }
  return (
    <div
      ref={ref}
      aria-label={typeof content === "string" ? peerName : undefined}
      className={fullClassName}
      data-peer-id={realPeer?.id}
      data-test-sender-id={IS_TEST ? realPeer?.id : undefined}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <div className="inner">
        {typeof content === "string"
          ? renderText(content, [size === "jumbo" ? "hq_emoji" : "emoji"])
          : content}
      </div>

      {/* && realPeer?.hasStories */}
      {withStory && (
        <AvatarStoryCircle
          peerId={realPeer?.id || "0"}
          size={size}
          withExtraGap={withStoryGap}
          withSolid={withStorySolid}
          forceFriendSolid={forceFriendStorySolid}
          forceUnreadSolid={forceUnreadStorySolid}
          viewerMode={storyViewerMode}
        />
      )}
      {badge && <div className="avatar-badge">{badge}</div>}
    </div>
  );
};

export default Avatar;
