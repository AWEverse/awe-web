const defferMicrotasks = (callback: () => void): void => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
  } else {
    Promise.resolve().then(callback);
  }
};

export default defferMicrotasks;
