import { EMediaReadyState, throttle } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useResizeObserver from "@/shared/hooks/DOM/useResizeObserver";
import { useThrottledFunction } from "@/shared/hooks/shedulers";
import { useRef, useEffect, useCallback } from "react";

const DEFAULT_FPS = 30;
const intervalMs = 1000 / DEFAULT_FPS;

const useAmbilight = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isDisabled: boolean = false,
) => {
  const lastPaintRef = useRef(0);
  const callbackId = useRef<number | NodeJS.Timeout | undefined>(undefined);
  const isRVFCSupported = useRef(false);
  const isPausedRef = useRef(false);
  const lastDimensionsRef = useRef<{ width: number; height: number } | null>(
    null,
  );
  const videoStateRef = useRef<"playing" | "paused" | "buffering">("paused");

  const stopAmbilightRepaint = useStableCallback(() => {
    if (callbackId.current === undefined) return;
    const video = videoRef.current;

    if (isRVFCSupported.current && video) {
      video.cancelVideoFrameCallback(callbackId.current as number);
    } else if (typeof callbackId.current === "number") {
      cancelAnimationFrame(callbackId.current);
    } else {
      clearTimeout(callbackId.current);
    }
    callbackId.current = undefined;
  });

  const pauseAmbilightRepaint = useStableCallback(() => {
    isPausedRef.current = true;
    stopAmbilightRepaint();
  });

  const updateCanvasDimensionsConsistently = useStableCallback(
    (entry?: ResizeObserverEntry) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const dims = entry
        ? { width: entry.contentRect.width, height: entry.contentRect.height }
        : lastDimensionsRef.current || {
          width: video.clientWidth,
          height: video.clientHeight,
        };

      lastDimensionsRef.current = dims;
      const dpr = window.devicePixelRatio || 1;
      const width = dims.width * dpr;
      const height = dims.height * dpr;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    },
  );

  useResizeObserver(videoRef, (entry) => {
    updateCanvasDimensionsConsistently(entry);
    if (videoStateRef.current === "playing") paintFrame(true);
  });

  const paintFrameImpl = useCallback(
    (bypassThrottle: boolean = false) => {
      if (isPausedRef.current || isDisabled) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || videoStateRef.current !== "playing") return;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context for canvas");
        pauseAmbilightRepaint();
        return;
      }

      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.error("Ambilight rendering error:", error);
        pauseAmbilightRepaint();
        return;
      }

      // Schedule next paint
      if (isRVFCSupported.current) {
        callbackId.current = video.requestVideoFrameCallback(() =>
          paintFrameImpl(),
        );
      } else {
        const now = performance.now();
        const elapsed = now - lastPaintRef.current;

        if (elapsed >= intervalMs || bypassThrottle) {
          lastPaintRef.current = now;
          callbackId.current = requestAnimationFrame(() => {
            paintFrameImpl();
          });
        } else {
          const remaining = intervalMs - elapsed;

          callbackId.current = setTimeout(() => {
            callbackId.current = requestAnimationFrame(() => {
              paintFrameImpl();
            });
          }, remaining);
        }
      }
    },
    [isDisabled, pauseAmbilightRepaint],
  );

  const paintFrame = useThrottledFunction(paintFrameImpl, intervalMs, true, [
    paintFrameImpl,
  ]);

  // Start painting with initial setup
  const startAmbilightRepaint = useCallback(() => {
    stopAmbilightRepaint();
    const video = videoRef.current;
    if (!video || isDisabled) return;

    isRVFCSupported.current =
      "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    updateCanvasDimensionsConsistently();

    if (videoStateRef.current === "playing") {
      if (isRVFCSupported.current) {
        callbackId.current = video.requestVideoFrameCallback(() =>
          paintFrameImpl(),
        );
      } else {
        lastPaintRef.current = performance.now();
        callbackId.current = requestAnimationFrame(() => {
          paintFrameImpl();
        });
      }
    }
  }, [
    stopAmbilightRepaint,
    paintFrameImpl,
    updateCanvasDimensionsConsistently,
    isDisabled,
  ]);

  const resumeAmbilightRepaint = useStableCallback(() => {
    isPausedRef.current = false;
    startAmbilightRepaint();
  });

  useEffect(() => {
    if (isDisabled) {
      pauseAmbilightRepaint();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const updateVideoState = () => {
      if (video.paused || video.ended) {
        videoStateRef.current = "paused";
      } else if (video.readyState < EMediaReadyState.HAVE_CURRENT_DATA) {
        // HAVE_CURRENT_DATA or less
        videoStateRef.current = "buffering";
      } else {
        videoStateRef.current = "playing";
      }
    };

    const handleVisibilityChange = () => {
      updateVideoState();
      if (document.visibilityState === "hidden") {
        pauseAmbilightRepaint();
      } else if (videoStateRef.current === "playing") {
        resumeAmbilightRepaint();
      }
    };


    const handlePlay = () => {
      updateVideoState();
      resumeAmbilightRepaint();
    };

    const handleSeeking = () => {
      updateVideoState();
      paintFrameImpl(true); // Immediate paint on seeking
    };

    const handleSeeked = () => {
      updateVideoState();
      if (videoStateRef.current === "playing") resumeAmbilightRepaint();
    };

    const handleWaiting = () => {
      videoStateRef.current = "buffering";
      pauseAmbilightRepaint();
    };

    const handlePlaying = () => {
      videoStateRef.current = "playing";
      resumeAmbilightRepaint();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadeddata", handlePlay);
    video.addEventListener("error", pauseAmbilightRepaint);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

    updateVideoState();
    if (videoStateRef.current === "playing") resumeAmbilightRepaint();

    return () => {
      stopAmbilightRepaint();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadeddata", handlePlay);
      video.removeEventListener("error", pauseAmbilightRepaint);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [
    isDisabled,
    pauseAmbilightRepaint,
    resumeAmbilightRepaint,
    paintFrameImpl,
  ]);

  useEffect(() => {
    return () => stopAmbilightRepaint();
  }, [stopAmbilightRepaint]);

  return { pauseAmbilightRepaint, resumeAmbilightRepaint };
};

export default useAmbilight;
