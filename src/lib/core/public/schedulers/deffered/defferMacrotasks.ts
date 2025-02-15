export const deferMacrotasks = (callback: NoneToVoidFunction) => {
  return typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : setTimeout(callback, 0);
};
