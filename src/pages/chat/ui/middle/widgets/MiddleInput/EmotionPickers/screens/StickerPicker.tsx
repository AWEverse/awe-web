import Sticker from "@/entities/Sticker";
import { FC, ReactNode } from "react";

import s from "./StickerPicker.module.scss";

interface OwnProps {}

interface StateProps {}

const StickerPicker: FC<OwnProps & StateProps> = () => {
  return (
    <section className={s.StickerPicker}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
        <Sticker
          key={num}
          src={`https://i.pravatar.cc/300?img=${num}`}
          alt={`Sticker ${num}`}
          size={120}
          borderRadius="5px"
          shadow={true}
          loading="lazy"
          placeholderType="shimmer"
          aspectRatio={1}
        />
      ))}
    </section>
  );
};

export default StickerPicker;
