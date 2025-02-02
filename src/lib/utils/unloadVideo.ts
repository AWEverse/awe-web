export function stopVideo(video: HTMLVideoElement) {
  if (!video) return;

  if (!video.paused) {
    video.pause();
  }

  if (video.src) {
    try {
      const url = new URL(video.src);
      if (url.protocol === "blob:") {
        URL.revokeObjectURL(url.href);
      }
    } catch (e) {
      // ignore
    }
  }

  video.src = "";

  if ("srcObject" in video) {
    video.srcObject = null;
  }

  video.load();
}

export function clearVideoElement(video: HTMLVideoElement) {
  if (!video) return;

  while (video.firstChild) {
    video.removeChild(video.firstChild);
  }
}

export default function unloadVideo(video: HTMLVideoElement) {
  if (!video) return;

  clearVideoElement(video);
  stopVideo(video);
}
