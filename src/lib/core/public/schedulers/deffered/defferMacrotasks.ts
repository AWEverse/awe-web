
const defferMacrotasks = (callback: NoneToVoidFunction) => {
  return typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : setTimeout(callback, 0);
};

export default defferMacrotasks;
