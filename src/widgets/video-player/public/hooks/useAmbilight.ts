import { requestMeasure } from "@/lib/modules/fastdom/fastdom";
import { useRef, useEffect, useMemo, useCallback } from "react";

const useAmbilight = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isDisabled: boolean = false,
) => {
  const fps = 30;
  const intervalMs = useMemo(() => 1000 / fps, [fps]);
  const callbackId = useRef<number | NodeJS.Timeout | undefined>(undefined);
  const lastPaintRef = useRef(0);
  const isRVFCSupported = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const getVideoElement = useCallback(() => videoRef.current, [videoRef]);
  const getCanvasElement = useCallback(() => canvasRef.current, [canvasRef]);

  const stopAmbilightRepaint = useCallback(() => {
    if (callbackId.current !== undefined) {
      if (isRVFCSupported.current) {
        getVideoElement()?.cancelVideoFrameCallback(
          callbackId.current as number,
        );
      } else {
        if (typeof callbackId.current === "number") {
          cancelAnimationFrame(callbackId.current);
        } else {
          clearTimeout(callbackId.current);
        }
      }
      callbackId.current = undefined;
    }
  }, [getVideoElement]);

  const updateCanvasDimensions = useCallback(() => {
    const video = getVideoElement();
    const canvas = getCanvasElement();
    if (video && canvas) {
      const dpr = window.devicePixelRatio || 1;
      const width = video.clientWidth * dpr;
      const height = video.clientHeight * dpr;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
  }, [getVideoElement, getCanvasElement]);

  const paintFrame = useCallback(() => {
    const videoElement = getVideoElement();
    const canvasElement = getCanvasElement();

    if (!videoElement || !canvasElement || videoElement.paused || isDisabled) {
      return;
    }

    try {
      requestMeasure(() => {
        updateCanvasDimensions();
        const ctx = canvasElement.getContext("2d", {
          willReadFrequently: false,
        });
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(
          videoElement,
          0,
          0,
          videoElement.videoWidth,
          videoElement.videoHeight,
          0,
          0,
          canvasElement.width,
          canvasElement.height,
        );
      });
    } catch (error) {
      console.error("Ambilight rendering error:", error);
      stopAmbilightRepaint();
      return;
    }

    if (isRVFCSupported.current) {
      callbackId.current = videoElement.requestVideoFrameCallback(paintFrame);
    } else {
      const now = performance.now();
      const elapsed = now - lastPaintRef.current;

      if (elapsed >= intervalMs) {
        lastPaintRef.current = now;
        callbackId.current = requestAnimationFrame(paintFrame);
      } else {
        const remaining = intervalMs - elapsed;
        callbackId.current = setTimeout(() => {
          callbackId.current = requestAnimationFrame(paintFrame);
        }, remaining);
      }
    }
  }, [
    intervalMs,
    isDisabled,
    stopAmbilightRepaint,
    updateCanvasDimensions,
    getVideoElement,
    getCanvasElement,
  ]);

  const startAmbilightRepaint = useCallback(() => {
    stopAmbilightRepaint();
    const videoElement = getVideoElement();
    if (!videoElement) return;

    isRVFCSupported.current =
      "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    updateCanvasDimensions();

    if (isRVFCSupported.current) {
      callbackId.current = videoElement.requestVideoFrameCallback(paintFrame);
    } else {
      lastPaintRef.current = performance.now();
      callbackId.current = requestAnimationFrame(paintFrame);
    }
  }, [
    stopAmbilightRepaint,
    getVideoElement,
    paintFrame,
    updateCanvasDimensions,
  ]);

  useEffect(() => {
    if (isDisabled) return;

    const videoElement = getVideoElement();
    const canvasElement = getCanvasElement();
    if (!videoElement || !canvasElement) return;

    // Set up observers and event listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopAmbilightRepaint();
      } else if (!videoElement.paused) {
        startAmbilightRepaint();
      }
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasDimensions();
      if (!videoElement.paused) {
        paintFrame();
      }
    });

    const handleSeeked = () => videoElement.paused && paintFrame();
    const handleError = () => stopAmbilightRepaint();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    videoElement.addEventListener("play", startAmbilightRepaint);
    videoElement.addEventListener("pause", stopAmbilightRepaint);
    videoElement.addEventListener("seeked", handleSeeked);
    videoElement.addEventListener("loadeddata", startAmbilightRepaint);
    videoElement.addEventListener("error", handleError);
    resizeObserverRef.current.observe(videoElement as unknown as Element);

    if (!videoElement.paused) {
      startAmbilightRepaint();
    }

    return () => {
      stopAmbilightRepaint();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      videoElement.removeEventListener("play", startAmbilightRepaint);
      videoElement.removeEventListener("pause", stopAmbilightRepaint);
      videoElement.removeEventListener("seeked", handleSeeked);
      videoElement.removeEventListener("loadeddata", startAmbilightRepaint);
      videoElement.removeEventListener("error", handleError);
      resizeObserverRef.current?.disconnect();
    };
  }, [
    isDisabled,
    startAmbilightRepaint,
    stopAmbilightRepaint,
    paintFrame,
    getVideoElement,
    getCanvasElement,
    updateCanvasDimensions,
  ]);

  useEffect(() => {
    if (isDisabled) stopAmbilightRepaint();
  }, [isDisabled, stopAmbilightRepaint]);

  // Cleanup on unmount
  useEffect(() => () => stopAmbilightRepaint(), [stopAmbilightRepaint]);
};

export default useAmbilight;
