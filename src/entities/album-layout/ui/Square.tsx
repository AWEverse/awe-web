import { FC, Children, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";
import buildStyle from "@/shared/lib/buildStyle";
import s from "./Square.module.scss";

interface OwnProps {
  containerRef: React.RefObject<HTMLDivElement>;
  currentColumn?: number;
  className?: string;
  children: React.ReactNode;
  onMouseOver?: () => void;
}

const Square: FC<OwnProps> = ({
  containerRef,
  currentColumn = 1,
  className,
  children,
  onMouseOver,
}) => {
  return (
    <div
      ref={containerRef}
      className={buildClassName(s.AlbumSquareWrapper, className)}
      onMouseOver={onMouseOver}
    >
      <div
        className={s.AlbumSquare}
        style={buildStyle(`--grid-columns: ${currentColumn}`)}
      >
        <AnimatePresence initial={false}>
          {Children.map(children, (child, index) => (
            <motion.div
              key={`square-item-${index}`}
              layout
              transition={{
                type: "spring",
                damping: 20,
                mass: 1,
                stiffness: 150,
              }}
              className={s.square}
            >
              {child}
            </motion.div>
          ))}{" "}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Square;
