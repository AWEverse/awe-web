import { FC, memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackNavigation from "@/shared/ui/TrackNavigation";
import FirstSlide from "./slides/FirstSlide";
import SecondSlide from "./slides/SecondSlide";

const MAX_SLIDES = 2;
const TRANSITION_DURATION = 0.25; // In seconds

const MediaBottomNavigation: FC = () => {
  const [index, setIndex] = useState(0);

  const onSlideChange = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((prevIndex) => (prevIndex === MAX_SLIDES - 1 ? 0 : prevIndex + 1));
  };

  const currentSlide = index === 0 ? <FirstSlide /> : <SecondSlide />;
  const slideDirection = index === 0 ? "toTop" : "toBottom";

  return (
    <section
      className="relative flex items-center gap-2 px-1 rounded-md cursor-pointer select-none h-16 w-full bg-awe-palette-secondary-main overflow-hidden"
      onClick={onSlideChange}
    >
      <TrackNavigation count={MAX_SLIDES} index={index} />
      <AnimatePresence>
        <motion.div
          key={slideDirection}
          className="absolute top-0 left-0 right-0 bottom-0 w-full h-full z-10 pl-3 flex items-center self-end gap-2"
          initial={{ opacity: 0, y: slideDirection === "toTop" ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: slideDirection === "toTop" ? -50 : 50 }}
          transition={{ duration: TRANSITION_DURATION }}
        >
          {currentSlide}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default memo(MediaBottomNavigation);
