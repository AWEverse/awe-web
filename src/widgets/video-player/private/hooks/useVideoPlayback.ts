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
  videoRef: React.RefObject<HTMLVideoElement | null>
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useStateSignal(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useStateSignal(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateVideoState = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
      setPlaybackRate(video.playbackRate);
      setIsPlaying(!video.paused);
    };

    const eventHandlers = {
      volumechange: updateVideoState,
      ratechange: updateVideoState,
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    updateVideoState();

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [videoRef, setVolume, setPlaybackRate]);

  const safeVideoAction = useStableCallback((
    action: (video: HTMLVideoElement) => void
  ) => {
    const video = videoRef.current;
    if (video) return action(video);
  }
  );

  const togglePlayState = useStableCallback(async () => {
    try {
      safeVideoAction((video) => {
        if (video.paused) {
          void playMedia(video);
        } else {
          pauseMedia(video);
        }
      });
    } catch (error) {
      console.error("Error toggling playback:", error);
      setIsPlaying(false);
    }
  });

  const handleVolumeChange = useStableCallback((value: number) => {
    safeVideoAction((video) => {
      const newVolume = clamp01(value);
      if (video.muted) video.muted = false;
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(false);
    });
  });

  const handleMuteClick = useStableCallback(() => {
    safeVideoAction((video) => {
      video.muted = !video.muted;
    });
  });

  const handlePlaybackRateChange = useStableCallback((value: number) => {
    safeVideoAction((video) => {
      setMediaPlayBackRate(video, value, 1);
    });
  });

  return {
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    togglePlayState,
    handleVolumeChange,
    handleMuteClick,
    handlePlaybackRateChange,
  };
};
