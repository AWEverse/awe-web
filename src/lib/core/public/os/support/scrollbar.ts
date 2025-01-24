export const SCROLLBAR_WIDTH = (() => {
  const el = document.createElement("div");
  el.style.cssText =
    "overflow:scroll; visibility:hidden; position:absolute; width:50px; height:50px;";
  document.body.appendChild(el);

  const width = el.offsetWidth - el.clientWidth;
  document.body.removeChild(el);

  document.documentElement.style.setProperty("--scrollbar-width", `${width}px`);

  return width;
})();
