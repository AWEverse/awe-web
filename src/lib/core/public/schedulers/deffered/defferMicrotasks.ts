export const deferMicrotasks = (callback: NoneToVoidFunction) => {
  (typeof queueMicrotask === 'function' ? queueMicrotask : Promise.resolve().then.bind(Promise))(
    callback,
  );
};
