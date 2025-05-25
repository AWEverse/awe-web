import { useStableCallback } from "@/shared/hooks/base";
import RippleEffect from "@/shared/ui/ripple-effect";
import { FC, useState, memo, ReactNode } from "react";

import s from "./PinnedMessageButton.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import TrackNavigation from "@/shared/ui/TrackNavigation";
import { AnimatePresence, motion } from "framer-motion";
import { SLIDE_VERTICAL } from "@/shared/animations/slideInVariant";
import { useSequenceDirection } from "@/lib/hooks/utilities/useSequenceDirection";

interface OwnProps {
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  onClick?: (index: number) => void;
}

interface PinnedMessageStateProps {
  /** URL for the avatar image */
  avatarUrl?: string;
  /** Index of the currently active segment */
  activeIndex?: number;
  /** If true, avatar is rounded as user */
  isUser?: boolean;
  /** Number of segments for navigation */
  segmentCount?: number;
}

type PinnedMessageButtonProps = OwnProps & PinnedMessageStateProps;

const SIZE = 36;

const PinnedMessageButton: FC<PinnedMessageButtonProps> = ({
  avatarUrl = "https://i.pravatar.cc/300",
  activeIndex: stateActiveIndex = 0,
  isUser = false,
  className,
  children,
  segmentCount = 3,
  style,
  onClick,
}) => {
  const [activeIndex, setActiveIndex] = useState(stateActiveIndex);

  const direction = useSequenceDirection({
    activeIndex,
    segmentCount,
  });

  const handleClick = useStableCallback(() => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % segmentCount;
      onClick?.(next);
      return next;
    });
  });

  return (
    <section
      data-active={activeIndex >= 0 ? "true" : undefined}
      data-size={SIZE}
      aria-pressed={activeIndex >= 0}
      className={buildClassName(s.pinnedMessageWrapper, className)}
      role="button"
      style={style}
      onClick={handleClick}
    >
      <div className={s.roller}>
        <TrackNavigation
          index={activeIndex}
          count={segmentCount}
          height={SIZE}
          width={3}
        />
      </div>

      <img
        width={SIZE}
        height={SIZE}
        className={buildClassName(
          s.pinnedMessageAvatar,
          isUser && s.userAvatar,
        )}
        alt={`Pinned message avatar #${activeIndex + 1}`}
        src={avatarUrl}
        loading="lazy"
        decoding="async"
      />

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={activeIndex}
          className={s.pinnedMessage}
          data-active={activeIndex >= 0 ? "true" : undefined}
          variants={SLIDE_VERTICAL}
          custom={direction}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <RippleEffect />
    </section>
  );
};

export default memo(PinnedMessageButton);
