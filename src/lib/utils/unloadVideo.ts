export function stopVideo(video: HTMLVideoElement): void {
  if (!video) return;

  if (!video.paused) video.pause();

  if (video.src) {
    try {
      if (video.src.startsWith("blob:")) URL.revokeObjectURL(video.src);
    } catch {
      // ignore
    }
    video.src = "";
  }

  if ("srcObject" in video) video.srcObject = null;
  video.load();
}

export function clearVideoElement(video: HTMLVideoElement): void {
  if (!video) return;
  video.replaceChildren();
}

export default function unloadVideo(video: HTMLVideoElement): void {
  if (!video) return;
  clearVideoElement(video);
  stopVideo(video);
}
