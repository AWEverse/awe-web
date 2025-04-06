import React, { FC, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackNavigation from "@/shared/ui/TrackNavigation";
import FirstRow from "./metadata/FirstRow";
import SecondRow from "./metadata/SecondRow";
import { useStableCallback } from "@/shared/hooks/base";
import s from "./index.module.scss";

const MAX_SLIDES = 2;
const SPRING_TRANSITION = { type: "spring", stiffness: 300, damping: 30 };

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 56 : -56, // From bottom if next, top if prev
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({
    y: direction < 0 ? 56 : -56, // To bottom if prev, top if next
    opacity: 0,
  }),
};

const MediaBottomNavigation: FC = () => {
  const [activeRow, setActiveRow] = React.useState(0);
  const [direction, setDirection] = React.useState(0); // Track direction explicitly

  const onRowChange = useStableCallback((e: React.MouseEvent<HTMLElement>) => {
    const nextIndex = (activeRow + 1) % MAX_SLIDES;
    setDirection(nextIndex > activeRow ? 1 : -1); // Determine direction
    setActiveRow(nextIndex);
  });

  return (
    <section className={s.MediaNavigation} onClick={onRowChange}>
      <div className={s.MediaTrackNavigation}>
        <TrackNavigation
          height={56}
          width={4}
          count={MAX_SLIDES}
          index={activeRow}
        />
      </div>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={activeRow} // Key changes based on index
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          custom={direction}
          transition={{ duration: 0.125, ...SPRING_TRANSITION }}
          className={s.slide}
        >
          {activeRow === 0 ? <FirstRow /> : <SecondRow />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default memo(MediaBottomNavigation);
