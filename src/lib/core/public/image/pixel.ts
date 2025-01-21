import { IVector2 } from "../math/vector2";

export type Color =
  | [r: number, g: number, b: number, a: number]
  | Uint8ClampedArray;

export const getPixel = (img: ImageData, { x, y }: IVector2): Color => {
  const i = y * img.width + x;
  return img.data.subarray(i * 4, i * 4 + 4);
};

export const setPixel = (
  img: ImageData,
  { x, y }: IVector2,
  color: Color,
): void => {
  const i = y * img.width + x;
  img.data.set(color, i * 4);
};
