import { usePrevious } from "@/shared/hooks/base";

interface UseSequenceDirectionProps {
  activeIndex: number;
  segmentCount: number;
}

export function useSequenceDirection({ activeIndex, segmentCount }: UseSequenceDirectionProps) {
  const prevIndex = usePrevious(activeIndex) || 0;

  const isFirstMount = prevIndex === null;

  if (segmentCount <= 0) {
    return 0;
  }

  if (isFirstMount) {
    return 1;
  }

  const diff = (activeIndex - prevIndex + segmentCount) % segmentCount;
  const isNoChange = diff === 0;
  const isForward = diff < segmentCount / 2;

  return isNoChange ? 0 : isForward ? -1 : 1;
}
