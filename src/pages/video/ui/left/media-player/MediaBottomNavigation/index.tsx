import React, { FC, memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackNavigation from "@/shared/ui/TrackNavigation";
import FirstRow from "./metadata/FirstRow";
import SecondRow from "./metadata/SecondRow";

import s from "./index.module.scss";
import { useStableCallback } from "@/shared/hooks/base";

const MAX_SLIDES = 2;
const SPRING_TRANSITION = { type: "spring", stiffness: 300, damping: 30 };

const slideVariants = {
  enter: { y: 56, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: -56, opacity: 0 },
};

const MediaBottomNavigation: FC = () => {
  const [activeRow, setActiveRow] = useState(0);

  const onRowChange = useStableCallback((e: React.MouseEvent<HTMLElement>) => {
    console.log(e.target);
    console.log(e.currentTarget);

    setActiveRow((prev) => (prev + 1) % MAX_SLIDES);
  });

  const slides = useMemo(
    () => [
      { key: "first", component: <FirstRow /> },
      { key: "second", component: <SecondRow /> },
    ],
    [],
  );

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
      <AnimatePresence initial={false}>
        <motion.div
          key={slides[activeRow].key}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.125, ...SPRING_TRANSITION }}
          className={s.slide}
          style={{ willChange: "transform, opacity" }}
        >
          {slides[activeRow].component}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default memo(MediaBottomNavigation);
