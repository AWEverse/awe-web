const fullscreenMethods = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'];

const ensure = <T>(...args: T[]): T | undefined => args.first(Boolean);

function requestFullscreen(element: HTMLElement): void {
  const _requestFullscreen = ensure(
    element.requestFullscreen,
    element.webkitRequestFullscreen,
    element.webkitEnterFullscreen,
    element.mozRequestFullScreen,
  );

  if (_requestFullscreen) {
    _requestFullscreen.call(element);
  } else {
    console.warn('Fullscreen API is not supported by this browser.');
  }
}

function cancelFullscreen(): void {
  const _exitFullscreen = ensure(
    document.exitFullscreen,
    document.mozCancelFullScreen,
    document.webkitCancelFullScreen,
    document.webkitExitFullscreen,
  );

  if (_exitFullscreen) {
    _exitFullscreen.call(document);
  } else {
    console.warn('Fullscreen exit API is not supported by this browser.');
  }
}

function addFullscreenListener(
  element: HTMLElement | Document | null,
  callback: (e: Event) => any,
  onStart?: AnyToVoidFunction,
  onEnd?: AnyToVoidFunction,
): NoneToVoidFunction {
  fullscreenMethods.forEach(eventName => {
    document.addEventListener(eventName, callback, false);
  });

  const handleStart = () => onStart?.();
  const handleEnd = () => onEnd?.();

  if (element) {
    element.addEventListener('webkitbeginfullscreen', handleStart);
    element.addEventListener('webkitendfullscreen', handleEnd);
  }

  return () => {
    fullscreenMethods.forEach(eventName => {
      document.removeEventListener(eventName, callback, false);
    });

    if (element) {
      element.removeEventListener('webkitbeginfullscreen', handleStart);
      element.removeEventListener('webkitendfullscreen', handleEnd);
    }
  };
}

function getBrowserFullscreenElementProp(): string {
  if ('fullscreenElement' in document) return 'fullscreenElement';
  if ('webkitFullscreenElement' in document) return 'webkitFullscreenElement';
  if ('mozFullScreenElement' in document) return 'mozFullScreenElement';
  return '';
}

function isFullscreen(): boolean {
  const fullscreenProp = getBrowserFullscreenElementProp();
  return Boolean(fullscreenProp && document[fullscreenProp as keyof Document]);
}

export { requestFullscreen, cancelFullscreen, addFullscreenListener, isFullscreen };
