import { requestMeasure, requestMutation } from '@/lib/modules/fastdom/fastdom';
import { useRef, useEffect } from 'react';

const useAmbilight = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  const previousTimeRef = useRef(0);
  const fps = 30;
  const intervalMs = 1000 / fps;
  let animationFrameId: number | undefined = undefined;

  useEffect(() => {
    const canvasElement = canvasRef.current!;
    const context = canvasElement?.getContext('2d');
    const videoElement = videoRef.current!;

    const repaintAmbilight = (currentTime: number) => {
      const elapsedTime = currentTime - previousTimeRef.current;

      if (elapsedTime >= intervalMs) {
        previousTimeRef.current = currentTime;

        requestMeasure(() => {
          context?.clearRect(0, 0, canvasElement.width, canvasElement.height);
          context?.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
        });
      }

      animationFrameId = window.requestAnimationFrame(repaintAmbilight);
    };

    const startAmbilightRepaint = () => {
      animationFrameId = window.requestAnimationFrame(repaintAmbilight);
    };

    const stopAmbilightRepaint = () => {
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
      }
    };

    const handleSeeked = () => {
      if (videoElement.paused) {
        repaintAmbilight(0);
      }
    };

    const handleLoadedData = () => {
      repaintAmbilight(0);
    };

    if (videoElement) {
      videoElement.addEventListener('play', startAmbilightRepaint);
      videoElement.addEventListener('pause', stopAmbilightRepaint);
      videoElement.addEventListener('ended', stopAmbilightRepaint);
      videoElement.addEventListener('seeked', handleSeeked);
      videoElement.addEventListener('loadeddata', handleLoadedData);
    }

    return () => {
      stopAmbilightRepaint();

      if (videoElement) {
        videoElement.removeEventListener('play', startAmbilightRepaint);
        videoElement.removeEventListener('pause', stopAmbilightRepaint);
        videoElement.removeEventListener('ended', stopAmbilightRepaint);
        videoElement.removeEventListener('seeked', handleLoadedData);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
      }
    };
  }, [videoRef, canvasRef, fps, intervalMs]);
};

export default useAmbilight;
