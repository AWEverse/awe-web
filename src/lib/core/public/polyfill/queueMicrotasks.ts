let resolvedPromise: Promise<void> | null = null;

const queueMicrotask: typeof globalThis.queueMicrotask =
  globalThis.queueMicrotask?.bind(globalThis) ??
  ((callback: NoneToVoidFunction): void => {
    (resolvedPromise ??= Promise.resolve())
      .then(callback)
      .catch((error) => setTimeout(() => { throw error; }, 0));
  });

export default queueMicrotask;
