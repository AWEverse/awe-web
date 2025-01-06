let onTickEndCallbacks: NoneToVoidFunction[] | undefined;

export default function onTickEnd(callback: NoneToVoidFunction) {
  if (!onTickEndCallbacks) {
    onTickEndCallbacks = [callback];

    queueMicrotask(() => {
      const currentCallbacks = onTickEndCallbacks!;
      onTickEndCallbacks = undefined;
      currentCallbacks.forEach(cb => cb());
    });
  }

  onTickEndCallbacks.push(callback);
}
