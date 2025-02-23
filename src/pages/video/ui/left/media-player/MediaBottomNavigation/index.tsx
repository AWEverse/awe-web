import { FC, memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackNavigation from "@/shared/ui/TrackNavigation";
import FirstSlide from "./slides/FirstSlide";
import SecondSlide from "./slides/SecondSlide";

const MAX_SLIDES = 2;
const SPRING_TRANSITION = { type: "spring", stiffness: 300, damping: 30 };

const VARIANTS = {
  enter: (direction: number) => ({
    y: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({
    y: direction < 0 ? -50 : 50,
    opacity: 0,
  }),
};

const MediaBottomNavigation: FC = () => {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const onSlideChange = useCallback(() => {
    // For example, if we're toggling between two slides, we can decide the direction:
    // Here, when moving from slide 0 to 1, direction is 1, otherwise -1.
    setDirection(slide === 0 ? 1 : -1);
    setSlide((prev) => (prev + 1) % MAX_SLIDES);
  }, [slide]);

  const slides = useMemo(
    () => [
      { key: "first", component: <FirstSlide /> },
      { key: "second", component: <SecondSlide /> },
    ],
    [],
  );

  return (
    <section
      className="relative flex items-center gap-2 px-1 rounded-md cursor-pointer select-none h-16 w-full bg-awe-palette-secondary-main overflow-hidden"
      onClick={onSlideChange}
    >
      <TrackNavigation height={56} width={4} count={MAX_SLIDES} index={slide} />
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={slides[slide].key}
          custom={direction}
          variants={VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.125, ...SPRING_TRANSITION }}
          className="absolute w-full h-full z-10 pl-3 flex items-center gap-2"
        >
          {slides[slide].component}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default memo(MediaBottomNavigation);
