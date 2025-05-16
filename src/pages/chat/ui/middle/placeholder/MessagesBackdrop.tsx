// MessagesBackdrop.tsx
import React, { useState } from "react";
import s from "./MessagesBackdrop.module.scss";
import buildClassName from "@/shared/lib/buildClassName";

interface MessagesBackdropProps {
  imageUrl?: string;
  previewUrl?: string; // низкое качество
  className?: string;
}

const MessagesBackdrop: React.FC<MessagesBackdropProps> = ({
  imageUrl = "src/pages/chat/assets/gargantua-black-3840x2160-9621.jpg",
  previewUrl,
  className,
}) => {
  const [loaded, setLoaded] = useState(false);
  const classNames = buildClassName(s.MessagesBackdrop, className);

  const previewSrc = previewUrl || imageUrl;

  return (
    <div inert className={classNames} aria-label="Chat backdrop" tabIndex={-1}>
      <img
        src={previewSrc}
        className={s.Preview}
        style={{
          filter: "blur(24px) grayscale(0.2)",
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.5s",
          opacity: loaded ? 0 : 1,
        }}
        aria-hidden="true"
        draggable={false}
        decoding="async"
        loading="lazy"
        fetchPriority="low"
      />
      <img
        src={imageUrl}
        className={s.Full}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.7s cubic-bezier(.4,0,.2,1)",
          opacity: loaded ? 1 : 0,
        }}
        onLoad={() => setLoaded(true)}
        alt="Chat backdrop"
        draggable={false}
        decoding="async"
        loading="lazy"
        fetchPriority="auto"
      />
    </div>
  );
};

export default MessagesBackdrop;
