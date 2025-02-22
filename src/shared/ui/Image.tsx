import {
  FC,
  JSX,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
 * Modern Image component with lazy loading, fallback support, and intersection observer.
 *
 * This component defers loading the image until it is in the viewport when
 * `observeIntersectionForLoading` is provided. It also handles error states by
 * falling back to a provided fallback image source.
 *
 * @param {OwnProps} props - The component props.
 * @returns {JSX.Element} The rendered image element or null if no container exists.
 */
const Image: FC<OwnProps> = ({
  src,
  alt,
  className,
  fallbackSrc = "https://via.placeholder.com/150",
  loading = "lazy",
  decoding = "async",
  srcSet,
  sizes,
  width,
  height,
  onError,
  observeIntersectionForLoading,
}: OwnProps): JSX.Element => {
  const [imgSrc, setImgSrc] = useState<string>(
    !observeIntersectionForLoading ? src : "",
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setImgSrc(!observeIntersectionForLoading ? src : "");
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

  const computedStyle = useMemo(
    () => ({
      opacity: isLoaded ? 1 : 0,
      transition: "opacity 0.125s ease-in-out",
    }),
    [isLoaded],
  );

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
      style={computedStyle}
      loading={loading}
      width={width}
      height={height}
    />
  );
};

export default memo(Image);
