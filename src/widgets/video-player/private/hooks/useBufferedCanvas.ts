import { useEffect, useRef, useCallback } from "react";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import { requestMutation } from "@/lib/modules/fastdom/fastdom";

const drawBufferedRanges = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ranges: BufferedRange[],
  canvasWidth: number,
  canvasHeight: number,
  duration: number,
) => {
  const canvas = canvasRef.current;
  if (!canvas || canvasWidth <= 0 || canvasHeight <= 0 || duration <= 0) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#B3E5FC";

  ranges.forEach(({ start, end }) => {
    const startX = (start / duration) * canvasWidth;
    const width = ((end - start) / duration) * canvasWidth;
    ctx.fillRect(startX, 0, width, canvasHeight);
  });
};

const useBufferedCanvas = (
  bufferedRanges: BufferedRange[],
  duration: number,
) => {
  const bufferedCanvas = useRef<HTMLCanvasElement | null>(null);

  const updateCanvas = useCallback(() => {
    const canvas = bufferedCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    requestMutation(() => {
      drawBufferedRanges(
        bufferedCanvas,
        bufferedRanges,
        canvas.width,
        canvas.height,
        duration,
      );
    });
  }, [bufferedRanges, duration]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  useEffect(() => {
    const canvas = bufferedCanvas.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width } = entry.contentRect;
      const scale = window.devicePixelRatio || 1;
      const newWidth = Math.floor(width * scale);

      if (canvas.width !== newWidth) {
        canvas.width = newWidth;
        canvas.height = 10;
        updateCanvas();
      }
    });

    observer.observe(canvas as Element);

    return () => observer.disconnect();
  }, [updateCanvas]);

  return bufferedCanvas;
};

export default useBufferedCanvas;
