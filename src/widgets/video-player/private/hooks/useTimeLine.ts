import { round, EMediaReadyState, clamp, BTimeRanges } from "@/lib/core";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";
import { useStableCallback } from "@/shared/hooks/base";
import { useCallback, useEffect, useState } from "react";

export const useTimeLine = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
) => {
  const [currentTime, setCurrentTime] = useStateSignal(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => setDuration(round(video.duration));

    video.addEventListener("loadedmetadata", updateDuration);
    return () => video.removeEventListener("loadedmetadata", updateDuration);
  }, [videoRef]);

  const handleSeek = useStableCallback((position: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(position)) return;

    try {
      const safePosition = clamp(position, 0, duration || video.duration);
      video.currentTime = safePosition;
      setCurrentTime(round(safePosition));
    } catch (error) {
      console.error("Seek failed:", error);
    }
  });

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      if (!video || video.readyState < EMediaReadyState.HAVE_METADATA) return;

      console.log("timeupdate")

      const newTime = round(video.currentTime);
      const newDuration = round(video.duration);

      if (duration !== newDuration) {
        setDuration(newDuration);
      }

      if (currentTime.value !== newTime) {
        setCurrentTime(newTime);
      }

      if (Math.abs(newTime - newDuration) < 0.1) {
        setCurrentTime(0);
        video.currentTime = 0;
      }
    },
    [currentTime.value, duration],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.currentTime)) {
      setCurrentTime(round(video.currentTime));
      setDuration(round(video.duration));
    }
  }, [videoRef]);

  return {
    currentTime: currentTime,
    duration: duration,
    handleSeek,
    handleTimeUpdate,
    setCurrentTime,
  };
};
