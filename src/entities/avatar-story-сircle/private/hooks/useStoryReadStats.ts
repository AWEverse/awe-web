import { countBy } from '@/lib/utils/iteratees';
import { useMemo } from 'react';

interface StoryReadStats {
  total: number;
  read: number;
  hasUnread: boolean;
}

const initialState: StoryReadStats = {
  total: 0,
  read: 0,
  hasUnread: false,
};

/**
 * Count how many story IDs are considered "read" based on the last read ID
 */
const readIds = (storyIds: number[], lastReadId: number | undefined): number => {
  if (!lastReadId) {
    return 0;
  }

  return countBy(storyIds, id => id <= lastReadId);
};

/**
 * Hook to calculate story read statistics
 * @param storyIds - Array of story IDs sorted chronologically
 * @param lastReadId - The ID of the last read story
 * @returns Object containing total stories, read stories count, and hasUnread flag
 */
function useStoryReadStats(storyIds: number[] | undefined, lastReadId: number | undefined): StoryReadStats {
  return useMemo(() => {
    if (!storyIds?.length) {
      return initialState;
    }

    const read = readIds(storyIds, lastReadId);
    const total = storyIds.length;

    return {
      total,
      read,
      hasUnread: read < total,
    };
  }, [lastReadId, storyIds]);
}

export default useStoryReadStats;
