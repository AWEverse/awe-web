import { countBy } from '@/lib/utils/iteratees';
import { useMemo } from 'react';

const initialState = {
  total: 0,
  read: 0,
};

const readIds = (storyIds: number[], lastReadId: number | undefined) => {
  if (!lastReadId) {
    return 0;
  }

  return countBy(storyIds, id => id <= lastReadId);
};

function useStoryReadStats(storyIds: number[] | undefined, lastReadId: number | undefined) {
  return useMemo(() => {
    if (!storyIds?.length) {
      return initialState;
    }

    return {
      total: storyIds.length,
      read: readIds(storyIds, lastReadId),
    };
  }, [lastReadId, storyIds]);
}

export default useStoryReadStats;
