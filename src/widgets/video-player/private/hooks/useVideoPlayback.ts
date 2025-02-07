import { useEffect, useState } from "react";
import {
  playMedia,
  pauseMedia,
  clamp,
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

    const handleRateChange = () => setPlaybackRate(video.playbackRate);

    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);

    return () => {
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
    };
  }, [videoRef]);

  const handlePlay = useStableCallback(() => setIsPlaying(true));
  const handlePause = useStableCallback(() => setIsPlaying(false));

  const togglePlayState = useStableCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        pauseMedia(video);
      } else {
        await playMedia(video);
      }
    } catch (error) {
      setIsPlaying(false);
    }
  });

  const handleVolumeChange = useStableCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = clamp01(value);

    video.muted = false;
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
