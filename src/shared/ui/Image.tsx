import {
  FC,
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
import { useStableCallback } from "@/shared/hooks/base";
import "./Image.scss";

type PlaceholderType = "blur" | "shimmer" | "color";
type FetchPriority = "high" | "low" | "auto";

interface OwnProps {
  // Basic image props
  src: string;
  alt: string;
  className?: string;
  title?: string;
  width: number;
  height?: number;
  aspectRatio?: number;

  // Loading behavior
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: FetchPriority;
  observeIntersectionForLoading?: ObserveFn;

  // Visual enhancements
  placeholderType?: PlaceholderType;
  placeholderColor?: string;
  placeholderBlur?: string;
  borderRadius?: string;

  // Fallbacks
  fallbackSrc?: string;
  retryLimit?: number;

  // Responsive
  srcSet?: string;
  sizes?: string;

  // Events
  onError?: () => void;
  onLoad?: () => void;
  onRetry?: (attempt: number) => void;

  // Accessibility
  decorative?: boolean;
}

/**
 * Production-ready image component with advanced lazy loading,
 * accessibility features, and visual enhancements
 * 📈 Performance Tips
 * - Always specify width and height or aspectRatio
 * - Use fetchPriority="high" for critical above-the-fold images
 * - Leverage srcSet for responsive design
 * - Set loading="lazy" for below-the-fold content
 * - Avoid large placeholder elements
 */
const Image: FC<OwnProps> = ({
  src,
  alt,
  className,
  title,
  width,
  height = width,
  aspectRatio = width / height,
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
  const [imgSrc, setImgSrc] = useState<string>(
    !observeIntersectionForLoading ? src : "",
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setImgSrc(!observeIntersectionForLoading ? src : "");
    setRetryCount(0);
  }, [src, observeIntersectionForLoading]);

  const handleImageLoad = useStableCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  });

  const handleError = useCallback(() => {
    if (retryCount < retryLimit) {
      setRetryCount((prev) => prev + 1);
      onRetry?.(retryCount + 1);
      setImgSrc(src);
    } else {
      setImgSrc(fallbackSrc);
    }
    onError?.();
  }, [retryCount, retryLimit, src, fallbackSrc, onError, onRetry]);

  const onIntersect = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        setImgSrc(src);
      }
    },
    [src],
  );

  useOnIntersect(imageRef, observeIntersectionForLoading, onIntersect);

  const containerStyle = useMemo(
    () => ({
      position: "relative" as const,
      width: `${width}px`,
      aspectRatio: `${aspectRatio}`,
      backgroundColor: placeholderColor,
      borderRadius,
    }),
    [width, aspectRatio, placeholderColor, borderRadius],
  );

  const placeholderStyle = useMemo(
    () => ({
      opacity: isLoaded ? 0 : 1,
      pointerEvents: "none" as const,
    }),
    [isLoaded],
  );

  return (
    <div
      className={buildClassName("ImageContainer", className)}
      style={containerStyle}
    >
      {/* Skeleton/Placeholder */}
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
        width={width}
        height={height}
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
        }}
      />

      {title && (
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "url": "${imgSrc}",
              "name": "${title}",
              "description": "${alt}"
            }
          `}
        </script>
      )}
    </div>
  );
};

export default memo(Image);

{
  /*
<Image
  src="/hero.jpg"
  alt="Sunset over mountain range"
  title="Mountain Landscape"
  width={800}
  height={600}
  aspectRatio={4 / 3}
  loading="eager"
  fetchPriority="high"
  placeholderType="shimmer"
  placeholderColor="#ddd"
  borderRadius="8px"
  srcSet="
    /hero-small.jpg 480w,
    /hero-medium.jpg 800w,
    /hero-large.jpg 1200w
  "
  sizes="(max-width: 768px) 100vw, 800px"
  onError={() => console.error("Image failed")}
  onRetry={(attempt) => console.log(`Attempt ${attempt}`)}
/>;
*/
}
