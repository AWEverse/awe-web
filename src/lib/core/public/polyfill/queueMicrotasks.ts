let resolvedPromise: Promise<void> | null = null;

let queueMicrotask: typeof globalThis.queueMicrotask;

if (typeof globalThis.queueMicrotask === "function") {
  queueMicrotask = globalThis.queueMicrotask.bind(globalThis);
} else {
  queueMicrotask = (callback: NoneToVoidFunction): void => {
    if (typeof callback !== "function") {
      throw new TypeError(
        `Failed to execute 'queueMicrotask': The callback provided is not a function.`,
      );
    }
    (resolvedPromise ??= Promise.resolve()).then(callback).catch((err) =>
      setTimeout(() => {
        throw err;
      }, 0),
    );
  };
}

export default queueMicrotask;
