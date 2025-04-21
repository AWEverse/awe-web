import { AnimatePresence, motion } from "framer-motion";
import { memo, useMemo } from "react";
import { PanelStackItem } from "./usePanelStack";

const slideVariants = {
  hidden: (dir: "forward" | "backward") => ({
    x: dir === "forward" ? "100%" : "-100%",
  }),
  visible: {
    x: 0,
  },
  exit: (dir: "forward" | "backward") => ({
    x: dir === "forward" ? "-100%" : "100%",
  }),
};

type PanelNavigatorProps = {
  stack: PanelStackItem[];
};

const PanelNavigator = memo(({ stack }: PanelNavigatorProps) => {
  const current = useMemo(() => stack.at(-1), [stack]);
  if (!current) return null;

  const { component: Component, props, direction, key } = current;

  return (
    <AnimatePresence initial={false} mode="popLayout" custom={direction}>
      <motion.div
        key={key}
        custom={direction}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={slideVariants}
        transition={{
          duration: 0.1875,
          ease: "easeOut",
        }}
        style={{
          willChange: "transform, opacity",
        }}
      >
        <Component {...props} />
      </motion.div>
    </AnimatePresence>
  );
});

export default PanelNavigator;
