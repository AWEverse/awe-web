import { requestMutation } from '@/lib/modules/fastdom/fastdom';
import { animate } from './animate';

const DEFAULT_DURATION = 300;

const START_DURATION = 0;
const END_DURATION = 1;

const stopById: Map<string, VoidFunction> = new Map();

export default function animateHorizontalScroll(
  container: HTMLElement,
  left: number,
  duration = DEFAULT_DURATION,
) {
  if (!duration) {
    duration = START_DURATION;
  }

  const isRtl = container.getAttribute('dir') === 'rtl';
  const {
    scrollLeft,
    offsetWidth: containerWidth,
    scrollWidth,
    dataset: { scrollId },
  } = container;

  let path = left - scrollLeft;

  if (path < START_DURATION) {
    path = Math.max(path, -scrollLeft * (isRtl ? -1 : 1));
  } else if (path > START_DURATION) {
    path = Math.min(path, scrollWidth - (scrollLeft + containerWidth));
  }

  if (path === START_DURATION) {
    return Promise.resolve();
  }

  if (scrollId && stopById.has(scrollId)) {
    stopById.get(scrollId)!();
  }

  const target = scrollLeft + path;

  return new Promise<void>(resolve => {
    requestMutation(() => {
      if (duration === START_DURATION) {
        container.scrollLeft = target;
        resolve();
        return;
      }

      let isStopped = false;
      const id = Math.random().toString();
      container.dataset.scrollId = id;

      stopById.set(id, () => {
        isStopped = true;
      });

      container.style.scrollSnapType = 'none';
      container.style.scrollBehavior = 'smooth';

      const startAt = Date.now();

      animate(requestMutation, () => {
        if (isStopped) {
          return false;
        }

        const elapsedTime = (Date.now() - startAt) / duration;
        const t = Math.min(elapsedTime, END_DURATION);
        const currentPath = path * (END_DURATION - transition(t));
        container.scrollLeft = Math.round(target - currentPath);

        if (t >= END_DURATION) {
          container.style.scrollSnapType = '';
          container.style.scrollBehavior = '';
          delete container.dataset.scrollId;
          stopById.delete(id);
          resolve();
        }

        return t < END_DURATION;
      });
    });
  });
}

function transition(t: number) {
  return END_DURATION - (END_DURATION - t) ** 3.5;
}
