import { FC, Children, useMemo, memo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";
import buildStyle from "@/shared/lib/buildStyle";
import s from "./Square.module.scss";

// Reusable animation configuration
const springConfig = {
  type: "spring",
  damping: 20,
  mass: 0.5,
  stiffness: 150,
  restDelta: 0.1,
};

const itemTransition = {
  type: "tween",
  duration: 0.18,
  ease: "easeOut",
};

interface OwnProps {
  containerRef: React.RefObject<HTMLDivElement>;
  currentColumn?: number;
  className?: string;
  children: React.ReactNode;
  onMouseOver?: () => void;
}

const Square: FC<OwnProps> = memo(
  ({ containerRef, currentColumn = 1, className, children, onMouseOver }) => {
    const gridStyle = useMemo(
      () => buildStyle(`--grid-columns: ${currentColumn}`),
      [currentColumn],
    );

    const memoizedChildren = useMemo(
      () => Children.toArray(children),
      [children],
    );

    return (
      <div
        ref={containerRef}
        className={buildClassName(s.AlbumSquareWrapper, className)}
        onMouseOver={onMouseOver}
      >
        <div className={s.AlbumSquare} style={gridStyle}>
          <LayoutGroup>
            <AnimatePresence initial={false}>
              {memoizedChildren.map((child, index) => (
                <motion.div
                  key={`square-item-${index}`}
                  layout
                  layoutScroll
                  transition={springConfig}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: itemTransition,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: itemTransition,
                  }}
                  className={s.square}
                  style={{ willChange: "transform, opacity" }}
                >
                  {child}
                </motion.div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>
    );
  },
);

export default Square;
