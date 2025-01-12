export function stopVideo(video: HTMLVideoElement) {
  if (!video) return;

  if (!video.paused) {
    video.pause();
  }

  video.removeAttribute('src');
  video.src = 'unloaded';

  if ('srcObject' in video) {
    video.srcObject = null;
  }

  video.load();
}

export function clearVideoElement(video: HTMLVideoElement) {
  if (!video) return;

  while (video.firstChild) {
    video.firstChild.remove();
  }
}

export default function unloadVideo(video: HTMLVideoElement) {
  if (!video) return;

  stopVideo(video);
  clearVideoElement(video);
}
