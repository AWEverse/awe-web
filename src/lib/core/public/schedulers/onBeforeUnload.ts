let beforeUnloadCallbacks: NoneToVoidFunction[] | undefined;

export default function onBeforeUnload(callback: NoneToVoidFunction, isLast = false) {
  if (!beforeUnloadCallbacks) {
    beforeUnloadCallbacks = [];

    self.addEventListener('beforeunload', () => {
      beforeUnloadCallbacks!.forEach(cb => cb());
    });
  }

  if (isLast) {
    beforeUnloadCallbacks.push(callback);
  } else {
    beforeUnloadCallbacks.unshift(callback);
  }

  return () => {
    beforeUnloadCallbacks = beforeUnloadCallbacks!.filter(cb => cb !== callback);
  };
}
