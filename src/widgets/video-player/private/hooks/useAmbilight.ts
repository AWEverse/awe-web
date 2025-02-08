import { throttle } from "@/lib/core";
import { requestMeasure } from "@/lib/modules/fastdom/fastdom";
import useResizeObserver from "@/shared/hooks/DOM/useResizeObserver";
import { useRef, useEffect, useCallback } from "react";

const fps = 30;
const intervalMs = 1000 / fps;

const useAmbilight = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isDisabled: boolean = false,
) => {
  const lastPaintRef = useRef(0);
  const callbackId = useRef<number | NodeJS.Timeout | undefined>(undefined);
  const isRVFCSupported = useRef(false);

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

    requestMeasure(() => {
      if (video && canvas) {
        const dpr = window.devicePixelRatio || 1;
        const width = video.clientWidth * dpr;
        const height = video.clientHeight * dpr;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }
    });
  }, [getVideoElement, getCanvasElement]);
  4;

  useResizeObserver(videoRef, () => {
    updateCanvasDimensions();

    if (!getVideoElement()!.paused) {
      paintFrame();
    }
  });

  const paintFrame = useCallback(
    throttle(
      () => {
        const videoElement = getVideoElement();
        const canvasElement = getCanvasElement();

        if (
          !videoElement ||
          !canvasElement ||
          videoElement.paused ||
          isDisabled
        ) {
          return;
        }

        try {
          const ctx = canvasElement.getContext("2d", {
            willReadFrequently: false,
          });

          if (!ctx) {
            return;
          }

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
        } catch (error) {
          console.error("Ambilight rendering error:", error);
          stopAmbilightRepaint();
          return;
        }

        if (isRVFCSupported.current) {
          callbackId.current =
            videoElement.requestVideoFrameCallback(paintFrame);
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
      },
      intervalMs,
      true,
    ),
    [
      intervalMs,
      isDisabled,
      stopAmbilightRepaint,
      updateCanvasDimensions,
      getVideoElement,
      getCanvasElement,
    ],
  );

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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopAmbilightRepaint();
      } else if (!videoElement.paused) {
        startAmbilightRepaint();
      }
    };

    const handleSeeked = () => {
      if (videoElement.paused) {
        startAmbilightRepaint();
      }
    };
    const handleError = () => stopAmbilightRepaint();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    videoElement.addEventListener("play", startAmbilightRepaint);
    videoElement.addEventListener("pause", stopAmbilightRepaint);
    videoElement.addEventListener("seeked", handleSeeked);
    videoElement.addEventListener("loadeddata", startAmbilightRepaint);
    videoElement.addEventListener("error", handleError);

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

  useEffect(() => () => stopAmbilightRepaint(), [stopAmbilightRepaint]);
};

export default useAmbilight;
