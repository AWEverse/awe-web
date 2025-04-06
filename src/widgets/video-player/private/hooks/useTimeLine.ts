import { round, EMediaReadyState, clamp } from "@/lib/core";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";
import { useStableCallback } from "@/shared/hooks/base";
import { useEffect, useState } from "react";

type TimeRange = [number, number];

export const useTimeLine = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [currentTime, setCurrentTime] = useStateSignal(0);
  const [duration, setDuration] = useState(0);

  const [buffered, setBuffered] = useState<TimeRange[]>([]);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => setDuration(round(video.duration));
    video.addEventListener("loadedmetadata", updateDuration);
    return () => video.removeEventListener("loadedmetadata", updateDuration);
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.readyState < EMediaReadyState.HAVE_METADATA) return;

      const newTime = round(video.currentTime);
      const newDuration = round(video.duration);

      if (duration !== newDuration) {
        setDuration(newDuration);
      }

      if (currentTime.value !== newTime) {
        setCurrentTime(newTime);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoRef, currentTime, duration, setCurrentTime, setDuration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffered = () => {
      const ranges: TimeRange[] = [];
      for (let i = 0; i < video.buffered.length; i++) {
        ranges.push([video.buffered.start(i), video.buffered.end(i)]);
      }
      setBuffered(ranges);
    };

    video.addEventListener("progress", updateBuffered);
    return () => video.removeEventListener("progress", updateBuffered);
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate, videoRef]);

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

  return {
    currentTime,          // Signal object with .value property
    duration,             // Total video duration (number)
    buffered,             // Array of [start, end] buffered ranges
    playbackRate,         // Current playback speed (e.g., 1, 1.5, 2)
    setPlaybackRate,      // Function to set playback speed
    handleSeek,           // Function to seek to a position
    setCurrentTime,       // Setter for currentTime signal
  };
};
