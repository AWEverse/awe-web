import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.scss";

interface GalleryProps {
  items: string[];
  setIndex: React.Dispatch<React.SetStateAction<number | false>>;
}

interface SingleImageProps {
  color: string;
  onClick: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, setIndex }) => {
  return (
    <motion.ul className="gallery-container" layout>
      {items.map((color, i) => (
        <motion.li
          className="gallery-item"
          key={color}
          onClick={() => setIndex(i)}
          style={{ backgroundColor: color, willChange: "transform" }}
          layoutId={color}
        >
          <img src={"https://picsum.photos/100/100"} />
        </motion.li>
      ))}
    </motion.ul>
  );
};

const SingleImage: React.FC<SingleImageProps> = ({ color, onClick }) => {
  return (
    <div className="single-image-container" onClick={onClick}>
      <motion.div
        layoutId={color}
        className="single-image"
        style={{ backgroundColor: color }}
      >
        <img src={"https://picsum.photos/500/300"} />
      </motion.div>
    </div>
  );
};

const TestPage: React.FC = () => {
  const [index, setIndex] = useState<number | false>(false);

  return (
    <>
      <Gallery items={colors} setIndex={setIndex} />
      <AnimatePresence>
        {index !== false && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              key="overlay"
              className="overlay"
              onClick={() => setIndex(false)}
            />
            <SingleImage
              key="image"
              color={colors[index]}
              onClick={() => setIndex(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const numColors = 4 * 4;
const makeColor = (hue: number): string => `hsl(${hue}, 100%, 50%)`;
const colors: string[] = Array.from(Array(numColors)).map((_, i) =>
  makeColor(Math.round((360 / numColors) * i)),
);

export default TestPage;
