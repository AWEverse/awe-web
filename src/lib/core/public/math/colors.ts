const randomHex = () => Math.floor(Math.random() * 16777215).toString(16);

export const randomColor = () => `#${randomHex()}`;
export const randomColorRGB = () =>
  `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
export const randomColorRGBA = () =>
  `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256,
  )}, ${Math.floor(Math.random() * 256)}, ${Math.random()})`;
export const randomColorHSL = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
export const randomColorHSLA = () =>
  `hsla(${Math.floor(Math.random() * 360)}, 100%, 50%, ${Math.random()})`;
export const randomColorHEX = () => `#${randomHex()}`;
export const randomColorHEXA = () => `#${randomHex()}${randomHex()}`;
export const randomColorHEXAA = () =>
  `#${randomHex()}${randomHex()}${randomHex()}`;
