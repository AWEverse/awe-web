import { usePrevious, useStableCallback } from "@/shared/hooks/base";
import RippleEffect from "@/shared/ui/ripple-effect";
import { FC, useState, useMemo, memo } from "react";

import s from "./PinnedMessageButton.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import TrackNavigation from "@/shared/ui/TrackNavigation";
import { AnimatePresence, motion } from "framer-motion";
import { SLIDE_TOP, SLIDE_VERTICAL } from "@/shared/animations/slideInVariant";

interface OwnProps {
  nodeRef?: React.Ref<HTMLDivElement>;
  className?: string;
  children?: React.ReactNode;
  segmentCount?: number;
  style?: React.CSSProperties;
  onClick?: (index: number) => void;
}

interface StateProps {
  activeIndex: number;
}

const PinnedMessageButton: FC<OwnProps & StateProps> = (props) => {
  const {
    nodeRef,
    className,
    children,
    segmentCount = 3,
    style,
    onClick,
  } = props;

  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex) || 0;

  const isFirstMount = activeIndex === 0 && prevIndex === 0;
  const diff = (activeIndex - prevIndex + segmentCount) % segmentCount;
  const direction = isFirstMount
    ? 1
    : diff === 0
      ? 0
      : diff < segmentCount / 2
        ? 1
        : -1;

  const handleClick = useStableCallback(() => {
    setActiveIndex((prev) => (prev + 1) % segmentCount);
    onClick?.(activeIndex);
  });

  return (
    <section
      ref={nodeRef}
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
          height={36}
          width={3}
        />
      </div>

      <img
        width={36}
        height={36}
        alt={`Pinned message avatar #${activeIndex + 1}`}
        src="https://i.pravatar.cc/300"
      />

      <AnimatePresence initial={false} mode={"wait"}>
        <motion.div
          key={activeIndex}
          className={s.pinnedMessage}
          data-active={activeIndex >= 0}
          variants={SLIDE_VERTICAL}
          custom={direction}
          initial={"hidden"}
          animate={"visible"}
          exit={"exit"}
        >
          <h5 className={s.pinnedAdditionalInfo}>
            Pinned message #{activeIndex + 1}
          </h5>
          <p className={s.pinnedMessageText}>This is a pinned message</p>
        </motion.div>
      </AnimatePresence>

      {children}
      <RippleEffect />
    </section>
  );
};

export default memo(PinnedMessageButton);
