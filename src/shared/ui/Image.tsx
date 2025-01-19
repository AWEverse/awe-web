import { FC, memo, useCallback, useRef, useState } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import {
  ObserveFn,
  useOnIntersect,
} from "@/lib/hooks/sensors/useIntersectionObserver";
import "./Image.scss";
import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";

interface OwnProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  srcSet?: string;
  sizes?: string;
  onError?: () => void;
  observeIntersectionForLoading?: ObserveFn;
  width: number; // Added for better layout control
  height: number; // Added for better layout control
}

/**
 * Image component with lazy loading, fallback support, and optional caption.
 *
 * Props:
 *
 * | **Property**               | **Example**                                      | **Type**                          | **Status**        |
 * |----------------------------|-------------------------------------------------|-----------------------------------|-------------------|
 * | `src`                       | `src="/profile.png"`                             | String                            | Required          |
 * | `width`                     | `width={500}`                                   | Integer (px)                      | Required          |
 * | `height`                    | `height={500}`                                  | Integer (px)                      | Required          |
 * | `alt`                       | `alt="Picture of the author"`                   | String                            | Required          |
 * | `loader`                    | `loader={imageLoader}`                          | Function                          | -                 |
 * | `fill`                      | `fill={true}`                                   | Boolean                           | -                 |
 * | `sizes`                     | `sizes="(max-width: 768px) 100vw, 33vw"`        | String                            | -                 |
 * | `quality`                   | `quality={80}`                                  | Integer (1-100)                   | -                 |
 * | `priority`                  | `priority={true}`                               | Boolean                           | -                 |
 * | `placeholder`               | `placeholder="blur"`                            | String                            | -                 |
 * | `style`                     | `style={{objectFit: "contain"}}`                | Object                            | -                 |
 * | `onLoad`                    | `onLoad={event => done())}`                     | Function                          | -                 |
 * | `onError`                   | `onError={event => fail()}`                     | Function                          | -                 |
 * | `loading`                   | `loading="lazy"`                                | String                            | -                 |
 * | `blurDataURL`               | `blurDataURL="data:image/jpeg..."`              | String                            | -                 |
 * | `overrideSrc`               | `overrideSrc="/seo.png"`                        | String                            | -                 |
 */
const Image: FC<OwnProps> = ({
  src,
  alt,
  className,
  fallbackSrc = "https://via.placeholder.com/150",
  loading = "lazy",
  srcSet,
  sizes,
  decoding = "async",
  width,
  height,
  onError,
  observeIntersectionForLoading,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);
    onError?.();
  }, [fallbackSrc, onError]);

  const handleImageLoad = useStableCallback(() => {
    setIsLoaded(true);
  });

  useOnIntersect(imageRef, observeIntersectionForLoading, (entry) => {
    if (entry.isIntersecting) {
      setImgSrc(src);
    }
  });

  return (
    <img
      alt={alt}
      ref={imageRef}
      className={buildClassName("Img", className)}
      decoding={decoding}
      src={imgSrc}
      srcSet={srcSet}
      sizes={sizes}
      onError={handleError}
      onLoad={handleImageLoad}
      style={isLoaded ? {} : { opacity: 0 }}
      loading={loading === "lazy" ? "lazy" : "eager"}
      width={width}
      height={height}
    />
  );
};

export default memo(Image);
