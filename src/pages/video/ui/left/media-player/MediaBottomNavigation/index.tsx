import { FC, memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackNavigation from "@/shared/ui/TrackNavigation";
import FirstSlide from "./slides/FirstSlide";
import SecondSlide from "./slides/SecondSlide";

const MAX_SLIDES = 2;
const SPRING_TRANSITION = { type: "spring", stiffness: 300, damping: 30 };
const VARIANTS = {
  enter: (direction: number) => ({ y: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction < 0 ? 50 : -50, opacity: 0 }),
};

const MediaBottomNavigation: FC = () => {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);

  const onSlideChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex(([prevIndex]) => {
      const newIndex = prevIndex === MAX_SLIDES - 1 ? 0 : prevIndex + 1;
      return [newIndex, newIndex > prevIndex ? 1 : -1];
    });
  }, []);

  const currentSlide = useMemo(
    () => (index === 0 ? <FirstSlide /> : <SecondSlide />),
    [index],
  );

  return (
    <section
      className="relative flex items-center gap-2 px-1 rounded-md cursor-pointer select-none h-16 w-full bg-awe-palette-secondary-main overflow-hidden"
      onClick={onSlideChange}
    >
      <TrackNavigation count={MAX_SLIDES} index={index} />

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={index}
          custom={direction}
          variants={VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SPRING_TRANSITION}
          className="absolute top-0 left-0 right-0 bottom-0 w-full h-full z-10 pl-3 flex items-center self-end gap-2"
        >
          {currentSlide}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default memo(MediaBottomNavigation);
