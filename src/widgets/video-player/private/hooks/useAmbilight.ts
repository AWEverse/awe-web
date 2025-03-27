import { EMediaReadyState } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useResizeObserver from "@/shared/hooks/DOM/useResizeObserver";
import { useCallback, useEffect, useRef } from "react";

interface AmbilightConfig {
  fps?: number;
  intensity?: number;
  drawMode?: "full" | "edges" | "blur";
  blurRadius?: number;
  edgeThickness?: number;
}

const useAmbilight = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  {
    fps = 30,
    intensity = 1,
    drawMode = "full",
    blurRadius = 15,
    edgeThickness = 0.2,
  }: AmbilightConfig = {},
  isDisabled: boolean = false,
) => {
  const rafId = useRef<number | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastTime = useRef(0);
  const isActive = useRef(!isDisabled);
  const interval = 1000 / fps;

  const updateDimensions = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const { clientWidth: w, clientHeight: h } = video;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctxRef.current = canvas.getContext("2d", { alpha: true });
    ctxRef.current?.scale(dpr, dpr);
  }, [videoRef, canvasRef]);

  const drawFrame = useCallback(
    (time: number) => {
      if (
        !isActive.current ||
        !videoRef.current ||
        !canvasRef.current ||
        !ctxRef.current
      )
        return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;

      if (time - lastTime.current < interval) {
        rafId.current = requestAnimationFrame(drawFrame);
        return;
      }

      lastTime.current = time;

      if (video.paused || video.readyState < EMediaReadyState.HAVE_CURRENT_DATA)
        return;

      ctx.globalAlpha = intensity;
      switch (drawMode) {
        case "full":
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          break;
        case "edges":
          const edge = canvas.width * edgeThickness;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            video,
            0,
            0,
            video.videoWidth,
            video.videoHeight * edgeThickness,
            0,
            0,
            canvas.width,
            edge,
          );
          ctx.drawImage(
            video,
            0,
            video.videoHeight * (1 - edgeThickness),
            video.videoWidth,
            video.videoHeight * edgeThickness,
            0,
            canvas.height - edge,
            canvas.width,
            edge,
          );
          ctx.drawImage(
            video,
            0,
            0,
            video.videoWidth * edgeThickness,
            video.videoHeight,
            0,
            0,
            edge,
            canvas.height,
          );
          ctx.drawImage(
            video,
            video.videoWidth * (1 - edgeThickness),
            0,
            video.videoWidth * edgeThickness,
            video.videoHeight,
            canvas.width - edge,
            0,
            edge,
            canvas.height,
          );
          break;
        case "blur":
          ctx.filter = `blur(${blurRadius}px)`;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";
          break;
      }
      rafId.current = requestAnimationFrame(drawFrame);
    },
    [
      drawMode,
      intensity,
      blurRadius,
      edgeThickness,
      videoRef,
      canvasRef,
      interval,
    ],
  );

  const start = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    updateDimensions();
    lastTime.current = performance.now();
    rafId.current = requestAnimationFrame(drawFrame);
  }, [updateDimensions, drawFrame]);

  const stop = useStableCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  });

  useEffect(() => {
    isActive.current = !isDisabled;
    if (!isDisabled) start();
    else stop();
    return stop;
  }, [isDisabled, start, stop]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleState = () => {
      updateDimensions();
      if (video.paused || video.ended) stop();
      else if (video.readyState >= EMediaReadyState.HAVE_CURRENT_DATA) start();
    };

    video.addEventListener("play", start);
    video.addEventListener("pause", stop);
    video.addEventListener("seeking", stop);
    video.addEventListener("seeked", handleState);
    video.addEventListener("waiting", stop);
    video.addEventListener("playing", start);
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : handleState(),
    );

    handleState();
    return () => {
      stop();
      video.removeEventListener("play", start);
      video.removeEventListener("pause", stop);
      video.removeEventListener("seeking", stop);
      video.removeEventListener("seeked", handleState);
      video.removeEventListener("waiting", stop);
      video.removeEventListener("playing", start);
      document.removeEventListener("visibilitychange", handleState);
    };
  }, [videoRef, start, stop, updateDimensions]);

  useResizeObserver(videoRef, updateDimensions);

  return { start, stop, forceRender: () => drawFrame(performance.now()) };
};

export default useAmbilight;
