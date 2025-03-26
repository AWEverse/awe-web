import { EMediaReadyState } from '@/lib/core';
import useResizeObserver from '@/shared/hooks/DOM/useResizeObserver';
import { useCallback, useEffect, useRef } from 'react';

// Configuration type for the hook
interface AmbilightConfig {
  fps?: number;
  intensity?: number;
  drawMode?: 'full' | 'edges' | 'blur';
  blurRadius?: number;
  edgeThickness?: number;
}

/**
 * A high-performance React hook that creates an ambilight effect by projecting video content onto a canvas.
 * Optimized for maximum efficiency and minimal resource usage.
 *
 * @param videoRef - Reference to the video element
 * @param canvasRef - Reference to the canvas element
 * @param config - Optional configuration for the ambilight effect
 * @param isDisabled - Flag to disable the effect
 * @returns Controls for manual management of the effect
 */
const useAmbilight = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: AmbilightConfig = {},
  isDisabled: boolean = false,
) => {
  // Extract config with defaults
  const {
    fps = 30,
    intensity = 1.0,
    drawMode = 'full',
    blurRadius = 15,
    edgeThickness = 0.2,
  } = config;

  const intervalMs = useRef(1000 / fps);

  useEffect(() => {
    intervalMs.current = 1000 / fps;
  }, [fps]);

  const callbackIdRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isRVFCSupportedRef = useRef<boolean | null>(null);
  const isPausedRef = useRef(false);
  const dimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const videoStateRef = useRef<'playing' | 'paused' | 'buffering'>('paused');
  const lastPaintTimeRef = useRef(0);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);

  /**
   * Safely cancels all animation callbacks to prevent memory leaks
   */
  const stopAllAnimations = useCallback(() => {
    if (callbackIdRef.current !== null) {
      const video = videoRef.current;
      if (isRVFCSupportedRef.current && video) {
        try {
          video.cancelVideoFrameCallback(callbackIdRef.current);
        } catch (e) {
          // Fallback if browser support changes
        }
      }
      callbackIdRef.current = null;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, [videoRef]);

  /**
   * Pauses the ambilight effect
   */
  const pauseAmbilight = useCallback(() => {
    isPausedRef.current = true;
    stopAllAnimations();
  }, [stopAllAnimations]);

  /**
   * Updates canvas dimensions based on video size and device pixel ratio
   * Uses memoization to prevent unnecessary recalculations
   */
  const updateCanvasDimensions = useCallback((entry?: ResizeObserverEntry) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return false;

    const newDimensions = entry
      ? { width: entry.contentRect.width, height: entry.contentRect.height }
      : dimensionsRef.current || {
        width: video.clientWidth,
        height: video.clientHeight,
      };

    const currentDims = dimensionsRef.current;
    if (
      currentDims &&
      currentDims.width === newDimensions.width &&
      currentDims.height === newDimensions.height &&
      canvas.width === newDimensions.width * (window.devicePixelRatio || 1) &&
      canvas.height === newDimensions.height * (window.devicePixelRatio || 1)
    ) {
      return false;
    }

    dimensionsRef.current = newDimensions;

    const dpr = window.devicePixelRatio || 1;
    const scaledWidth = newDimensions.width * dpr;
    const scaledHeight = newDimensions.height * dpr;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const ctx = canvas.getContext('2d', { alpha: true });

    if (ctx) {
      contextRef.current = ctx;
      ctx.scale(dpr, dpr);
    }

    return true;
  }, [canvasRef, videoRef]);

  /**
   * Applies the selected drawing mode for the ambilight effect
   */
  const applyDrawMode = useCallback((
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) => {
    switch (drawMode) {
      case ('full'):
      default: {
        ctx.globalAlpha = intensity;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        break;
      }
      case ('edges'): {
        const edgeSize = canvas.width * edgeThickness;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          video,
          0, 0, video.videoWidth, video.videoHeight * edgeThickness,
          0, 0, canvas.width, edgeSize
        );
        ctx.drawImage(
          video,
          0, video.videoHeight * (1 - edgeThickness), video.videoWidth, video.videoHeight * edgeThickness,
          0, canvas.height - edgeSize, canvas.width, edgeSize
        );
        ctx.drawImage(
          video,
          0, 0, video.videoWidth * edgeThickness, video.videoHeight,
          0, 0, edgeSize, canvas.height
        );
        ctx.drawImage(
          video,
          video.videoWidth * (1 - edgeThickness), 0, video.videoWidth * edgeThickness, video.videoHeight,
          canvas.width - edgeSize, 0, edgeSize, canvas.height
        );
        break;
      }
      case ('blur'): {
        ctx.filter = `blur(${blurRadius}px)`;
        ctx.globalAlpha = intensity;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        break;
      }
    }
  }, [drawMode, intensity, blurRadius, edgeThickness]);

  /**
   * Core rendering function that paints a single frame of the ambilight effect
   */
  const paintFrame = useCallback((forceRender: boolean = false) => {
    if (isPausedRef.current || isDisabled) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || videoStateRef.current !== 'playing') return;

    let ctx = contextRef.current;

    if (!ctx) {
      ctx = canvas.getContext('2d');
      if (!ctx) {
        const now = performance.now();
        if (now - lastErrorTimeRef.current > 5000) {
          errorCountRef.current = 0;
          lastErrorTimeRef.current = now;
        }

        if (errorCountRef.current < 3) {
          console.error('Failed to get 2D context for ambilight canvas');
          errorCountRef.current++;
        }

        pauseAmbilight();
        return;
      }
      contextRef.current = ctx;
    }

    try {
      const now = performance.now();
      const elapsed = now - lastPaintTimeRef.current;

      if (elapsed >= intervalMs.current || forceRender) {
        lastPaintTimeRef.current = now;

        applyDrawMode(ctx, video, canvas);

        if (isRVFCSupportedRef.current) {
          callbackIdRef.current = video.requestVideoFrameCallback(() => paintFrame());
        } else {
          rafIdRef.current = requestAnimationFrame(() => paintFrame());
        }
      } else {
        const delay = intervalMs.current - elapsed;

        timeoutIdRef.current = setTimeout(() => {
          rafIdRef.current = requestAnimationFrame(() => paintFrame());
        }, delay);
      }
    } catch (error) {
      const now = performance.now();
      if (now - lastErrorTimeRef.current > 5000) {
        errorCountRef.current = 0;
        lastErrorTimeRef.current = now;
      }

      if (errorCountRef.current < 3) {
        console.error('Ambilight rendering error:', error);
        errorCountRef.current++;
      }

      pauseAmbilight();
    }
  }, [
    isDisabled,
    videoRef,
    canvasRef,
    pauseAmbilight,
    applyDrawMode
  ]);

  /**
   * Starts or resumes the ambilight effect
   */
  const startAmbilight = useCallback(() => {
    stopAllAnimations();

    const video = videoRef.current;
    if (!video || isDisabled) return;

    if (isRVFCSupportedRef.current === null) {
      isRVFCSupportedRef.current = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    }

    updateCanvasDimensions();

    if (videoStateRef.current === 'playing') {
      lastPaintTimeRef.current = performance.now();

      if (isRVFCSupportedRef.current) {
        callbackIdRef.current = (video as any).requestVideoFrameCallback(() => paintFrame());
      } else {
        rafIdRef.current = requestAnimationFrame(() => paintFrame());
      }
    }
  }, [
    stopAllAnimations,
    videoRef,
    isDisabled,
    updateCanvasDimensions,
    paintFrame
  ]);

  /**
   * Resumes the ambilight effect if it was paused
   */
  const resumeAmbilight = useCallback(() => {
    isPausedRef.current = false;
    startAmbilight();
  }, [startAmbilight]);


  useResizeObserver(videoRef, (entry) => {
    updateCanvasDimensions(entry);
    if (videoStateRef.current === "playing") paintFrame(true);
  });

  useEffect(() => {
    if (isDisabled) {
      pauseAmbilight();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const updateVideoState = () => {
      if (video.paused || video.ended) {
        videoStateRef.current = 'paused';
      } else if (video.readyState < EMediaReadyState.HAVE_CURRENT_DATA) {
        videoStateRef.current = 'buffering';
      } else {
        videoStateRef.current = 'playing';
      }
    };

    const handleVisibilityChange = () => {
      updateVideoState();

      if (document.visibilityState === 'hidden') {
        pauseAmbilight();
      } else if (videoStateRef.current === 'playing') {
        resumeAmbilight();
      }
    };

    const handlePlay = () => {
      updateVideoState();
      resumeAmbilight();
    };

    const handleSeeking = () => {
      updateVideoState();
      paintFrame(true);
    };

    const handleSeeked = () => {
      updateVideoState();
      if (videoStateRef.current === 'playing') resumeAmbilight();
    };

    const handleWaiting = () => {
      videoStateRef.current = 'buffering';
      pauseAmbilight();
    };

    const handlePlaying = () => {
      videoStateRef.current = 'playing';
      resumeAmbilight();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', pauseAmbilight);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('loadeddata', handlePlay);
    video.addEventListener('error', pauseAmbilight);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', pauseAmbilight);

    updateVideoState();
    if (videoStateRef.current === 'playing') resumeAmbilight();

    return () => {
      stopAllAnimations();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', pauseAmbilight);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('loadeddata', handlePlay);
      video.removeEventListener('error', pauseAmbilight);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', pauseAmbilight);
    };
  }, [
    isDisabled,
    videoRef,
    canvasRef,
    pauseAmbilight,
    resumeAmbilight,
    paintFrame,
    stopAllAnimations
  ]);

  useEffect(() => {
    return () => stopAllAnimations();
  }, [stopAllAnimations]);

  return {
    pauseAmbilight,
    resumeAmbilight,
    updateCanvasDimensions,
    forceRender: () => paintFrame(true),
  };
};

export default useAmbilight;
