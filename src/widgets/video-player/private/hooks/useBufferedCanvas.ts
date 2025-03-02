import { useEffect, useRef, useCallback } from "react";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import {
  getDevicePixelRatio,
} from "@/lib/hooks/sensors/useDevicePixelRatio";
import useResizeObserver from "@/shared/hooks/DOM/useResizeObserver";

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

    drawBufferedRanges(
      bufferedCanvas,
      bufferedRanges,
      canvas.width,
      canvas.height,
      duration,
    );

  }, [bufferedRanges, duration]);

  useResizeObserver(bufferedCanvas, (entry) => {
    const canvas = bufferedCanvas.current;
    if (!canvas) return;

    const { width } = entry.contentRect;
    const scale = getDevicePixelRatio();
    const newWidth = Math.floor(width * scale);

    if (canvas.width !== newWidth) {
      canvas.width = newWidth;
      canvas.height = 10;
      updateCanvas();
    }
  });

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  return bufferedCanvas;
};

export default useBufferedCanvas;
