import {
  FC,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import buildClassName from "@/shared/lib/buildClassName";
import {
  ObserveFn,
  useOnIntersect,
} from "@/shared/hooks/DOM/useIntersectionObserver";
import { useStableCallback } from "@/shared/hooks/base";
import "./Image.scss";

type PlaceholderType = "blur" | "shimmer" | "color";
type FetchPriority = "high" | "low" | "auto";

interface OwnProps {
  src: string;
  alt: string;
  className?: string;
  title?: string;
  width: number | string;
  height?: number | string;
  aspectRatio?: number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: FetchPriority;
  observeIntersectionForLoading?: ObserveFn;
  placeholderType?: PlaceholderType;
  placeholderColor?: string;
  placeholderBlur?: string;
  borderRadius?: string;
  fallbackSrc?: string;
  retryLimit?: number;
  srcSet?: string;
  sizes?: string;
  onError?: () => void;
  onLoad?: () => void;
  onRetry?: (attempt: number) => void;
  decorative?: boolean;
}

const Image: FC<OwnProps> = ({
  src,
  alt,
  className,
  title,
  width,
  height = width,
  aspectRatio,
  loading = "lazy",
  decoding = "async",
  fetchPriority = "auto",
  observeIntersectionForLoading,
  placeholderType = "shimmer",
  placeholderColor = "#f0f0f0",
  placeholderBlur = "8px",
  borderRadius = "0",
  fallbackSrc = "/fallback.jpg",
  retryLimit = 3,
  srcSet,
  sizes,
  onError,
  onLoad,
  onRetry,
  decorative = false,
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>(
    !observeIntersectionForLoading ? src : "",
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [hasTriedFallback, setHasTriedFallback] = useState<boolean>(false);

  const computedAspectRatio = useMemo(() => {
    if (aspectRatio) return aspectRatio;
    if (
      typeof width === "number" &&
      typeof height === "number" &&
      width &&
      height
    ) {
      return width / height;
    }
    return 1;
  }, [aspectRatio, width, height]);

  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  useLayoutEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth !== 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }

    if (!observeIntersectionForLoading) {
      setImgSrc(src);
    }

    setRetryCount(0);
    setHasTriedFallback(false);
  }, [src, observeIntersectionForLoading]);

  const handleImageLoad = useStableCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  });

  const handleError = useCallback(() => {
    if (!hasTriedFallback && retryCount >= retryLimit) {
      setImgSrc(fallbackSrc);
      setHasTriedFallback(true);
    } else if (retryCount < retryLimit) {
      setRetryCount((prev) => prev + 1);
      onRetry?.(retryCount + 1);
      setImgSrc(src);
    }
    onError?.();
  }, [
    retryCount,
    retryLimit,
    src,
    fallbackSrc,
    onError,
    onRetry,
    hasTriedFallback,
  ]);

  const onIntersect = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting && !imgSrc) {
        setImgSrc(src);
      }
    },
    [src, imgSrc],
  );

  useOnIntersect(
    imageRef,
    observeIntersectionForLoading,
    observeIntersectionForLoading ? onIntersect : undefined,
  );

  const containerStyle = useMemo(
    () => ({
      position: "relative" as const,
      width: widthStyle,
      height: heightStyle,
      aspectRatio:
        typeof width === "number" && typeof height === "number"
          ? `${computedAspectRatio}`
          : undefined,
      borderRadius,
      overflow: "hidden",
    }),
    [
      widthStyle,
      heightStyle,
      computedAspectRatio,
      placeholderColor,
      borderRadius,
      width,
      height,
    ],
  );

  const placeholderStyle = useMemo(
    () => ({
      opacity: isLoaded ? 0 : 1,
      pointerEvents: "none" as const,
    }),
    [isLoaded],
  );

  const jsonLd = useMemo(() => {
    if (!title) return null;
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ImageObject",
        url: imgSrc,
        name: title,
        description: alt,
      }),
    };
  }, [imgSrc, title, alt]);

  return (
    <div
      className={buildClassName("ImageContainer", className)}
      style={containerStyle}
      aria-busy={!isLoaded}
    >
      {!isLoaded && (
        <div
          className={buildClassName(
            "ImagePlaceholder",
            `ImagePlaceholder--${placeholderType}`,
          )}
          style={placeholderStyle}
          aria-hidden="true"
        >
          {placeholderType === "blur" && (
            <div
              className="ImagePlaceholder-blur"
              style={{ filter: `blur(${placeholderBlur})` }}
            />
          )}
        </div>
      )}
      <img
        ref={imageRef}
        alt={decorative ? "" : alt}
        aria-hidden={decorative ? true : undefined}
        role={decorative ? "presentation" : undefined}
        title={title}
        src={imgSrc}
        srcSet={srcSet}
        sizes={sizes}
        decoding={decoding}
        loading={loading}
        fetchPriority={fetchPriority}
        onLoad={handleImageLoad}
        onError={handleError}
        className={buildClassName("Img", isLoaded && "Img--loaded")}
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "scale(1)" : "scale(0.95)",
          borderRadius,
          willChange: "opacity, transform",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          width: typeof width === "string" ? width : "100%",
          height: typeof height === "string" ? height : "100%",
          objectFit: "cover",
        }}
      />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd} />
      )}
    </div>
  );
};

export default memo(Image);
