import { useRef, useMemo, useLayoutEffect, memo, useCallback } from "react";
import useDevicePixelRatio from "@/lib/hooks/sensors/useDevicePixelRatio";
import buildClassName from "@/shared/lib/buildClassName";
import theme from "@/app/providers/theme-provider";
import { Box, BoxProps } from "@mui/material";
import {
  SIZES,
  DARK_GRAY,
  GRAY,
  PURPLE,
  GREEN,
  BLUE,
} from "../../private/constants";
import useStoryReadStats from "../../private/hooks/useStoryReadStats";
import drawGradientCircle from "../../private/lib/drawGradientCircle";
import { AvatarSize } from "../../private/types";

interface StoryObject {
  id: number;
  isForCloseFriends?: boolean;
  isPremium?: boolean;
  viewsCount?: number;
}

interface OwnProps {
  peerId: string;
  className?: string;
  sx?: BoxProps["sx"];
  size: AvatarSize;
  withExtraGap?: boolean;
  withSolid?: boolean;
  forceFriendSolid?: boolean;
  forceUnreadSolid?: boolean;
  viewerMode?: "full" | "single-peer" | "disabled";
  onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

interface StateProps {
  peerStories?: Record<number, StoryObject>;
  storyIds?: number[];
  lastReadId?: number;
}

/**
 * AvatarStoryCircle - Component for rendering story circle around avatars
 * Renders a canvas with gradient segments representing stories status
 */
const AvatarStoryCircle = memo((props: OwnProps & StateProps) => {
  const {
    size = "large",
    className,
    sx,
    peerStories,
    storyIds,
    lastReadId,
    withExtraGap,
    withSolid,
    forceFriendSolid,
    forceUnreadSolid,
    viewerMode = "full",
    onClick,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = useDevicePixelRatio();
  const isDarkMode = theme.palette.mode === "dark";

  // Get stats for read/unread stories
  const { total, read, hasUnread } = useStoryReadStats(storyIds, lastReadId);

  // Logic to determine if any unread stories are for close friends
  const hasPriorityContent = useMemo(() => {
    if (!peerStories || !storyIds?.length) {
      return { isCloseFriend: false, isPremium: false };
    }

    let isCloseFriend = false;
    let isPremium = false;

    // Check for close friends or premium content in unread stories
    for (const id of storyIds) {
      const story = peerStories[id];
      if (!story) continue;

      const isUnread = !lastReadId || story.id > lastReadId;
      if (!isUnread) continue;

      if (story.isForCloseFriends) {
        isCloseFriend = true;
      }

      if (story.isPremium) {
        isPremium = true;
      }

      // If we found both priority types, no need to continue
      if (isCloseFriend && isPremium) break;
    }

    return { isCloseFriend, isPremium };
  }, [lastReadId, peerStories, storyIds]);

  // Calculate circle color based on content type
  const circleColor = useMemo(() => {
    if (hasPriorityContent.isCloseFriend) return "green";
    if (hasPriorityContent.isPremium) return "purple";
    return "blue";
  }, [hasPriorityContent]);

  // Size calculations
  const maxSize = SIZES[size];

  // Handle draw for solid background if specified
  const handleSolidBackground = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerCoordinate = (maxSize * dpr) / 2;
    const radius = (maxSize * dpr) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(centerCoordinate, centerCoordinate, radius, 0, 2 * Math.PI);

    if (forceFriendSolid && hasUnread) {
      const colorStops =
        circleColor === "purple"
          ? PURPLE
          : circleColor === "green"
            ? GREEN
            : BLUE;
      const gradient = ctx.createLinearGradient(
        20,
        0,
        Math.ceil(maxSize * dpr * Math.cos(Math.PI / 2)),
        Math.ceil(maxSize * dpr * Math.sin(Math.PI / 2)),
      );

      colorStops.forEach((colorStop, index) => {
        gradient.addColorStop(index / (colorStops.length - 1), colorStop);
      });

      ctx.fillStyle = gradient;
    } else {
      const baseColor = isDarkMode
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.08)";
      ctx.fillStyle = baseColor;
    }

    ctx.fill();
  }, [circleColor, dpr, forceFriendSolid, hasUnread, isDarkMode, maxSize]);

  // Draw circle effect
  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    if (withSolid) {
      handleSolidBackground();
      return;
    }

    drawGradientCircle({
      canvas: canvasRef.current,
      size: maxSize * dpr,
      segmentsCount: total,
      color: circleColor,
      readSegmentsCount: read,
      withExtraGap,
      readSegmentColor: isDarkMode ? DARK_GRAY : GRAY,
      dpr,
    });
  }, [
    dpr,
    circleColor,
    maxSize,
    read,
    total,
    withExtraGap,
    withSolid,
    handleSolidBackground,
    isDarkMode,
  ]);

  // No stories to show
  if (!total) {
    return null;
  }

  // Determine pointer events based on viewer mode
  const pointerEvents = viewerMode === "disabled" ? "none" : "auto";

  return (
    <Box
      ref={canvasRef}
      className={buildClassName(
        "AvatarStoryCircle",
        `size-${size}`,
        withExtraGap && "with-extra-gap",
        withSolid && "with-solid",
        forceFriendSolid && "force-friend-solid",
        forceUnreadSolid && "force-unread-solid",
        viewerMode && `viewer-mode-${viewerMode}`,
        className,
      )}
      component="canvas"
      data-size={size}
      data-has-unread={hasUnread}
      data-color={circleColor}
      onClick={onClick}
      sx={{
        maxWidth: maxSize,
        maxHeight: maxSize,
        cursor: viewerMode !== "disabled" ? "pointer" : "default",
        pointerEvents,
        ...sx,
      }}
    />
  );
});

AvatarStoryCircle.displayName = "AvatarStoryCircle";

export default AvatarStoryCircle;
