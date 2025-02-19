import { DEBUG } from "@/lib/config/dev";
import { IS_SAFARI } from "@/lib/core";
import { requestMutation } from "@/lib/modules/fastdom";
import { applyStyles } from "@/lib/utils/animation/animateNumber";
import unloadVideo from "@/lib/utils/unloadVideo";
import { RefObject, useEffect } from "react";
import { makeLocalProgressiveLoader } from "../lib/load/makeProgressiveLoader";

const VIDEO_REVEAL_DELAY = 100;
const MAX_SOURCE_OPEN_WAIT = 5000; // 5 seconds timeout for MediaSource to open

export function useStreaming(
  videoRef: RefObject<HTMLVideoElement>,
  url?: string,
  mimeType?: string,
) {
  useEffect(() => {
    if (!url || !videoRef.current) return undefined;
    const MediaSourceClass = getMediaSource();
    const video = videoRef.current;

    if (
      !IS_SAFARI ||
      !mimeType ||
      !MediaSourceClass?.isTypeSupported(mimeType)
    ) {
      return undefined;
    }

    const abortController = new AbortController();
    let mediaSource: MediaSource | undefined;
    let currentSourceBuffer: SourceBuffer | undefined;
    let currentOnUpdateEnded: (() => void) | undefined;
    let onLoadedMetadata: (() => void) | undefined;
    let sourceOpenTimeout: number | undefined;

    const revealVideo = () => {
      requestMutation(() => {
        video.style.display = "block";
        setTimeout(() => {
          requestMutation(() => {
            applyStyles(video, { opacity: "1" });
          });
        }, VIDEO_REVEAL_DELAY);
      });
    };

    const handleError = (error: Error, context: string) => {
      if (DEBUG && !abortController.signal.aborted) {
        console.error(`[Stream] Error in ${context}:`, error);
      }
    };

    const onSourceOpen = () => {
      if (!url || !mimeType || abortController.signal.aborted) return;

      try {
        const sourceBuffer = mediaSource!.addSourceBuffer(mimeType);
        const loader = makeLocalProgressiveLoader(url);

        const onUpdateEnded = () => {
          if (abortController.signal.aborted) return;

          loader
            .next()
            .then(({ value, done }) => {
              if (
                abortController.signal.aborted ||
                mediaSource!.readyState !== "open"
              )
                return;

              if (done) {
                endOfStream(mediaSource!);
                return;
              }

              appendBuffer(sourceBuffer, value);
            })
            .catch((error) => handleError(error, "chunk loading"));
        };

        sourceBuffer.addEventListener("updateend", onUpdateEnded);
        currentSourceBuffer = sourceBuffer;
        currentOnUpdateEnded = onUpdateEnded;

        loader
          .next()
          .then(({ value, done }) => {
            if (
              abortController.signal.aborted ||
              done ||
              mediaSource!.readyState !== "open"
            )
              return;
            appendBuffer(sourceBuffer, value);
          })
          .catch((error) => handleError(error, "initial chunk loading"));
      } catch (error) {
        handleError(error as Error, "source buffer creation");
      }
    };

    mediaSource = new MediaSourceClass();
    mediaSource.addEventListener("sourceopen", onSourceOpen, { once: true });

    // Handle MediaSource errors
    mediaSource.addEventListener("error", () => {
      if (DEBUG) {
        console.error(
          "[Stream] MediaSource error state:",
          mediaSource!.readyState,
        );
      }
    });

    // Set up video element
    requestMutation(() => {
      applyStyles(video, { display: "none", opacity: "0" });
      video.src = URL.createObjectURL(mediaSource);

      onLoadedMetadata = () => revealVideo();
      video.addEventListener("loadedmetadata", onLoadedMetadata, {
        once: true,
      });
    });

    // Fallback in case sourceopen never fires
    sourceOpenTimeout = window.setTimeout(() => {
      if (mediaSource!.readyState === "closed") {
        handleError(
          new Error("MediaSource failed to open"),
          "sourceopen timeout",
        );
      }
    }, MAX_SOURCE_OPEN_WAIT);

    // Cleanup function
    return () => {
      abortController.abort();
      clearTimeout(sourceOpenTimeout);

      requestMutation(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Clean up video event listeners
        if (onLoadedMetadata) {
          videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
        }

        // Clean up MediaSource
        if (mediaSource) {
          mediaSource.removeEventListener("sourceopen", onSourceOpen);
          if (mediaSource.readyState === "open") {
            endOfStream(mediaSource);
          }
        }

        // Clean up SourceBuffer
        if (currentSourceBuffer && currentOnUpdateEnded) {
          currentSourceBuffer.removeEventListener(
            "updateend",
            currentOnUpdateEnded,
          );
        }

        // Unload video resources
        const src = videoElement.src;
        unloadVideo(videoElement);
        URL.revokeObjectURL(src);
      });
    };
  }, [mimeType, url, videoRef]);

  return checkIfStreamingSupported(mimeType);
}

// Rest of the helper functions remain the same
function checkIfStreamingSupported(mimeType?: string) {
  if (!IS_SAFARI || !mimeType) return false;
  return Boolean(getMediaSource()?.isTypeSupported(mimeType));
}

function appendBuffer(sourceBuffer: SourceBuffer, buffer: ArrayBuffer) {
  try {
    if (!sourceBuffer.updating) {
      sourceBuffer.appendBuffer(buffer);
    }
  } catch (error) {
    if (DEBUG) {
      console.warn("[Stream] Failed to append buffer:", error);
    }
  }
}

function endOfStream(mediaSource: MediaSource) {
  try {
    mediaSource.endOfStream();
  } catch (error) {
    if (DEBUG) {
      console.warn("[Stream] Failed to end stream:", error);
    }
  }
}

function getMediaSource(): typeof MediaSource | undefined {
  if ("ManagedMediaSource" in window) {
    // @ts-ignore
    return window.ManagedMediaSource;
  }
  if ("MediaSource" in window) {
    return window.MediaSource;
  }
  return undefined;
}
