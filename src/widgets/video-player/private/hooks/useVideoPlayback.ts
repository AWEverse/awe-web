import { useEffect, useState } from "react";
import {
  playMedia,
  pauseMedia,
  clamp01,
  setMediaPlayBackRate,
} from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";

export const useVideoPlayback = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useStateSignal(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useStateSignal(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };

    const handlePlayEvent = () => {
      setIsPlaying(true);
    };

    const handlePauseEvent = () => {
      setIsPlaying(false);
    };

    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("play", handlePlayEvent);
    video.addEventListener("pause", handlePauseEvent);

    handleVolumeChange();
    handleRateChange();
    setIsPlaying(!video.paused);

    return () => {
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
      video.removeEventListener("play", handlePlayEvent);
      video.removeEventListener("pause", handlePauseEvent);
    };
  }, [videoRef, setVolume, setPlaybackRate]);

  const handlePlay = useStableCallback(() => {
    setIsPlaying(true);
  });

  const handlePause = useStableCallback(() => {
    setIsPlaying(false);
  });

  const togglePlayState = useStableCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        await playMedia(video);
      } else {
        pauseMedia(video);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      setIsPlaying(false);
    }
  });

  const handleVolumeChange = useStableCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = clamp01(value);
    if (video.muted) video.muted = false;
    video.volume = newVolume;

    setVolume(newVolume);
    setIsMuted(false);
  });

  const handleMuteClick = useStableCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  });

  const handlePlaybackRateChange = useStableCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    setMediaPlayBackRate(video, value, 1);
  });

  return {
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    handlePlay,
    handlePause,
    togglePlayState,
    handleVolumeChange,
    handleMuteClick,
    handlePlaybackRateChange,
  };
};
