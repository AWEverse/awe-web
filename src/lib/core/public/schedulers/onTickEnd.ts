let onTickEndCallbacks: NoneToVoidFunction[] | undefined;
let isScheduled = false;

export default function onTickEnd(callback: NoneToVoidFunction) {
  if (!onTickEndCallbacks) {
    onTickEndCallbacks = [];
  }

  onTickEndCallbacks.push(callback);

  if (!isScheduled) {
    isScheduled = true;

    Promise.resolve().then(() => {
      const currentCallbacks = onTickEndCallbacks!;
      onTickEndCallbacks = undefined;
      isScheduled = false;

      for (let i = 0; i < currentCallbacks.length; i++) {
        try {
          currentCallbacks[i]();
        } catch (error) {
          console.error('Error in onTickEnd callback:', error);
        }
      }
    });
  }
}
