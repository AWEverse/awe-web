import { useRef, useMemo, useLayoutEffect, memo } from 'react';

import useDevicePixelRatio from '@/lib/hooks/sensors/useDevicePixelRatio';
import buildClassName from '@/shared/lib/buildClassName';
import theme from '@/app/providers/theme-provider';
import { Box, BoxProps } from '@mui/material';
import { SIZES, DARK_GRAY, GRAY } from '../../private/constants';
import useStoryReadStats from '../../private/hooks/useStoryReadStats';
import drawGradientCircle from '../../private/lib/drawGradientCircle';
import { AvatarSize } from '../../private/types';

interface OwnProps {
  peerId: string;
  className?: string;
  sx: BoxProps['sx'];
  size: AvatarSize;
  withExtraGap?: boolean;
}

interface StateProps {
  // TODO: replace any type with correct type from API
  peerStories?: Record<number, { id: number }>;
  storyIds?: number[];
  lastReadId?: number;
}

const AvatarStoryCircle = memo((props: OwnProps & StateProps) => {
  const { size = 'large', className, sx, peerStories, storyIds, lastReadId, withExtraGap } = props;

  const ref = useRef<HTMLCanvasElement>(null);
  const dpr = useDevicePixelRatio();

  const { total, read } = useStoryReadStats(storyIds, lastReadId);

  const isCloseFriend = useMemo(() => {
    if (!peerStories || !storyIds?.length) {
      return false;
    }

    return storyIds.some(id => {
      const story = peerStories[id];

      if (!story || !('isForCloseFriends' in story)) {
        return false;
      }

      const isRead = lastReadId && story.id <= lastReadId;

      return story.isForCloseFriends && !isRead;
    });
  }, [lastReadId, peerStories, storyIds]);

  const maxSize = SIZES[size];

  useLayoutEffect(() => {
    if (ref.current) {
      drawGradientCircle({
        canvas: ref.current,
        size: maxSize * dpr,
        segmentsCount: total,
        color: isCloseFriend ? 'green' : 'blue',
        readSegmentsCount: read,
        withExtraGap,
        readSegmentColor: theme.palette.mode === 'dark' ? DARK_GRAY : GRAY,
        dpr,
      });
    }
  }, [dpr, isCloseFriend, maxSize, read, total, withExtraGap]);

  if (!total) {
    return undefined;
  }

  return (
    <Box
      ref={ref}
      className={buildClassName('story-circle', size, className)}
      component="canvas"
      data-size={size}
      sx={{
        maxWidth: maxSize,
        maxHeight: maxSize,
        ...sx,
      }}
    />
  );
});

export default AvatarStoryCircle;
