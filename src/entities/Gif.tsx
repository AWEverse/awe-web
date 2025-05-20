import { useReducedMotion } from "framer-motion";
import { FC, useState } from "react";
import Lottie from "lottie-react";

export interface SmartMediaSource {
  type: "gif" | "video" | "webp" | "lottie";
  url: string;
  preview?: string;
  loop?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  fallback?: string;
}

interface Props {
  media: SmartMediaSource;
  className?: string;
  style?: React.CSSProperties;
}

const SmartMedia: FC<Props> = ({ media, className, style }) => {
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(media.autoplay && !reduceMotion);

  const handlePlayToggle = () => {
    if (reduceMotion) setPlaying((p) => !p);
  };

  const commonProps = {
    className,
    style,
    loop: media.loop ?? true,
    muted: media.muted ?? true,
    autoPlay: media.autoplay && !reduceMotion,
    playsInline: true,
    onClick: handlePlayToggle,
  };

  switch (media.type) {
    case "gif":
      return (
        <img
          src={playing ? media.url : media.preview || media.url}
          alt="GIF"
          className={className}
          style={style}
          onClick={handlePlayToggle}
        />
      );

    case "video":
      return <video src={media.url} {...commonProps} controls={false} />;

    case "webp":
      return (
        <img
          src={media.url}
          alt="Animated image"
          className={className}
          style={style}
        />
      );

    case "lottie":
      return (
        <Lottie
          animationData={media.url}
          loop={media.loop ?? true}
          autoplay={media.autoplay && !reduceMotion}
          onClick={handlePlayToggle}
          className={className}
          style={style}
        />
      );

    default:
      return media.fallback ? (
        <img src={media.fallback} alt="Fallback" className={className} />
      ) : null;
  }
};

export default SmartMedia;
