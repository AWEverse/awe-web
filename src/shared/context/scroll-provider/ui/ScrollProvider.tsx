import { IS_ANDROID } from "@/lib/core";
import { getIsMobile } from "@/lib/hooks/ui/useAppLayout";
import useBackgroundMode from "@/lib/hooks/ui/useBackgroundMode";
import { useIntersectionObserver } from "@/shared/hooks/DOM/useIntersectionObserver";
import React, { ReactNode, useMemo } from "react";
import { ScrollContext } from "../../lib/contex";

const INTERSECTION_THROTTLE_FOR_MEDIA = IS_ANDROID ? 1000 : 350;
const INTERSECTION_MARGIN_FOR_LOADING = getIsMobile() ? 300 : 500;

interface OwnProps {
  containerRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
}

const ScrollProvider = ({ children, containerRef }: OwnProps) => {
  const readingOptions = useMemo(
    () => ({
      rootRef: containerRef,
    }),
    [],
  );

  const { observe: observeIntersectionForReading } =
    useIntersectionObserver(readingOptions);

  const loadingOptions = useMemo(
    () => ({
      rootRef: containerRef,
      throttleMs: INTERSECTION_THROTTLE_FOR_MEDIA,
      margin: INTERSECTION_MARGIN_FOR_LOADING,
    }),
    [],
  );

  const {
    observe: observeIntersectionForLoading,
    freeze,
    unfreeze,
  } = useIntersectionObserver(loadingOptions);

  const playingOptions = useMemo(
    () => ({
      rootRef: containerRef,
      throttleMs: INTERSECTION_THROTTLE_FOR_MEDIA,
    }),
    [],
  );

  const { observe: observeIntersectionForPlaying } =
    useIntersectionObserver(playingOptions);

  useBackgroundMode(freeze, unfreeze);

  const contextValue = useMemo(
    () => ({
      observeIntersectionForReading,
      observeIntersectionForLoading,
      observeIntersectionForPlaying,
    }),
    [
      observeIntersectionForReading,
      observeIntersectionForLoading,
      observeIntersectionForPlaying,
    ],
  );

  return (
    <ScrollContext.Provider value={contextValue}>
      {children}
    </ScrollContext.Provider>
  );
};

export default ScrollProvider;
