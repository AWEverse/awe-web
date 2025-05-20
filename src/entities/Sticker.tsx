import Image from "@/shared/ui/Image";
import { FC, memo } from "react";

import s from "./Sticker.module.scss";
import buildClassName from "@/shared/lib/buildClassName";

interface StickerProps {
  src: string;
  alt?: string;
  size?: number;
  borderRadius?: string;
  shadow?: boolean;
  className?: string;
  loading?: "lazy" | "eager";
  placeholderType?: "blur" | "shimmer" | "color";
  aspectRatio?: number;
}

const Sticker: FC<StickerProps> = ({
  src,
  alt = "Sticker",
  size = 60,
  borderRadius = "12px",
  shadow = false,
  className = "",
  loading = "lazy",
  placeholderType = "shimmer",
  aspectRatio = 1,
}) => {
  return (
    <div className={s.StickerContainer}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        aspectRatio={aspectRatio}
        className={buildClassName(
          s.Sticker,
          { [s.StickerShadow]: shadow },
          className,
        )}
        borderRadius={borderRadius}
        loading={loading}
        placeholderType={placeholderType}
        decorative={alt === ""}
      />
    </div>
  );
};

export default memo(Sticker);
