import { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import {
  ObserveFn,
  useOnIntersect,
} from "@/shared/hooks/DOM/useIntersectionObserver";
import "./Image.scss";
import { useStableCallback } from "@/shared/hooks/base";

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
  width: number; // For layout control
  height: number; // For layout control
}

/**
 * Image component with lazy loading, fallback support, and optional caption.
 *
 * ### Props
 *
 * | Property                        | Example                                        | Type               | Status   |
 * |---------------------------------|------------------------------------------------|--------------------|----------|
 * | `src`                           | `src="/profile.png"`                           | String             | Required |
 * | `width`                         | `width={500}`                                  | Integer (px)       | Required |
 * | `height`                        | `height={500}`                                 | Integer (px)       | Required |
 * | `alt`                           | `alt="Picture of the author"`                  | String             | Required |
 * | `fallbackSrc`                   | `fallbackSrc="https://via.placeholder.com/150"`| String             | Optional |
 * | `loading`                       | `loading="lazy"`                               | "lazy" or "eager"   | Optional |
 * | `decoding`                      | `decoding="async"`                             | "async", "auto", "sync" | Optional |
 * | `srcSet`                        | `srcSet="..."`                                 | String             | Optional |
 * | `sizes`                         | `sizes="(max-width: 768px) 100vw, 33vw"`         | String             | Optional |
 * | `onError`                       | `onError={() => {}}`                           | Function           | Optional |
 * | `observeIntersectionForLoading` | `observeIntersectionForLoading={...}`         | Function           | Optional |
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
  const [imgSrc, setImgSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    if (!observeIntersectionForLoading) {
      setImgSrc(src);
    } else {
      setImgSrc("");
    }
  }, [src, observeIntersectionForLoading]);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);
    onError?.();
  }, [fallbackSrc, onError]);

  const handleImageLoad = useStableCallback(() => {
    setIsLoaded(true);
  });

  const onIntersect = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        setImgSrc(src);
      }
    },
    [src],
  );

  useOnIntersect(imageRef, observeIntersectionForLoading, onIntersect);

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
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
      loading={loading === "lazy" ? "lazy" : "eager"}
      width={width}
      height={height}
    />
  );
};

export default memo(Image);
