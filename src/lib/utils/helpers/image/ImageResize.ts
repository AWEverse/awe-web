import { preloadImage } from '../files';
import { getAverageColor, getColorLuma } from './colors';

const LUMA_THRESHOLD = 240;

export async function scaleImage(image: string | Blob, ratio: number, outputType: string = 'image/png'): Promise<string> {
  return processImage(image, null, null, ratio, outputType);
}

export async function resizeImage(
  image: string | Blob,
  width: number,
  height: number,
  outputType: string = 'image/png',
): Promise<string> {
  return processImage(image, width, height, null, outputType);
}

const isCreateImageBitmapSupported = 'createImageBitmap' in window;

const scaleWithFallback = (img: HTMLImageElement, width: number, height: number, outputType: string = 'image/png') =>
  steppedScale(img, width, height, undefined, outputType);

async function processImage(
  image: string | Blob,
  width: number | null,
  height: number | null,
  ratio: number | null,
  outputType: string = 'image/png',
): Promise<string> {
  const url = image instanceof Blob ? URL.createObjectURL(image) : image;

  try {
    const img = await preloadImage(url);
    const resizedWidth = width ?? img.width * ratio!;
    const resizedHeight = height ?? img.height * ratio!;

    const resizedBlob = await scale(img, resizedWidth, resizedHeight, outputType);

    if (!resizedBlob) {
      throw new Error('Image resize failed!');
    }

    return URL.createObjectURL(resizedBlob);
  } finally {
    if (image instanceof Blob) {
      URL.revokeObjectURL(url);
    }
  }
}

async function scale(
  img: HTMLImageElement,
  width: number,
  height: number,
  outputType: string = 'image/png',
): Promise<Blob | null> {
  // Safari does not have built-in resize method with quality control
  if (isCreateImageBitmapSupported) {
    try {
      const bitmap = await window.createImageBitmap(img, {
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: 'high',
      });

      if (bitmap.height !== height || bitmap.width !== width) {
        console.error('Image bitmap resize not supported!');
        throw new Error('Image bitmap resize not supported!'); // FF93 added support for options, but not resize
      }

      const averageColor = await getAverageColor(img.src);
      const fillColor = getColorLuma(averageColor) < LUMA_THRESHOLD ? '#fff' : '#000';

      return await new Promise(res => {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx2D = canvas.getContext('2d')!;
        ctx2D.fillStyle = fillColor;
        ctx2D.fillRect(0, 0, canvas.width, canvas.height);

        const ctx = canvas.getContext('bitmaprenderer');

        if (ctx) {
          ctx.transferFromImageBitmap(bitmap);
        } else {
          ctx2D.drawImage(bitmap, 0, 0);
        }

        canvas.toBlob(res, outputType);
      });
    } catch (e) {
      // Fallback. Firefox below 93 does not recognize `createImageBitmap` with 2 parameters
      console.error(
        `Failed to resize image: ${e}. Fallback. \nFirefox below 93 does not recognize \`createImageBitmap\` with 2 parameters`,
      );
      return scaleWithFallback(img, width, height, outputType);
    }
  } else {
    return scaleWithFallback(img, width, height, outputType);
  }
}

async function steppedScale(
  img: HTMLImageElement,
  width: number,
  height: number,
  step: number = 0.5,
  outputType: string = 'image/png',
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const oc = document.createElement('canvas');
  const octx = oc.getContext('2d')!;

  canvas.width = width;
  canvas.height = height;

  if (img.width * step > width) {
    // For performance avoid unnecessary drawing
    const mul = 1 / step;
    let cur = {
      width: Math.floor(img.width * step),
      height: Math.floor(img.height * step),
    };

    oc.width = cur.width;
    oc.height = cur.height;

    octx.drawImage(img, 0, 0, cur.width, cur.height);

    while (cur.width * step > width) {
      cur = {
        width: Math.floor(cur.width * step),
        height: Math.floor(cur.height * step),
      };

      octx.drawImage(oc, 0, 0, cur.width * mul, cur.height * mul, 0, 0, cur.width, cur.height);
    }

    ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  const averageColor = await getAverageColor(img.src);
  const fillColor = getColorLuma(averageColor) < LUMA_THRESHOLD ? '#fff' : '#000';

  ctx.fillStyle = fillColor;
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return new Promise(resolve => {
    canvas.toBlob(resolve, outputType);
  });
}
