// MessagesBackdrop.tsx
import React from "react";
import s from "./MessagesBackdrop.module.scss";
import buildClassName from "@/shared/lib/buildClassName";

interface MessagesBackdropProps {
  imageUrl?: string;
  className?: string;
}

const MessagesBackdrop: React.FC<MessagesBackdropProps> = ({
  imageUrl = "src/pages/chat/assets/gargantua-black-3840x2160-9621.jpg",
  className,
}) => {
  const classNames = buildClassName(s.MessagesBackdrop, className);

  return (
    <></>
    // <img
    //   src={imageUrl}
    //   decoding="async"
    //   aria-label="Chat backdrop"
    //   className={classNames}
    //   role="img"
    //   tabIndex={-1}
    // ></img>
  );
};

export default MessagesBackdrop;
