import React, { useState, useEffect } from "react";
import s from "./RegresBar.module.scss";
import { useInterval } from "../hooks/shedulers";

interface OwnProps {
  duration: number;
  onComplete?: () => void;
}

const RegressBar: React.FC<OwnProps> = ({ duration = 1000, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [width, setWidth] = useState<number>(100);

  useInterval(() => {
    setTimeLeft((prevTime) => {
      const newTimeLeft = Math.max(prevTime - 50, 0);

      if (newTimeLeft <= 0) {
        if (onComplete) {
          onComplete();
        }

        return 0;
      }

      return newTimeLeft;
    });
  }, 50);

  useEffect(() => {
    setWidth((timeLeft / duration) * 100);
  }, [timeLeft, duration]);

  return (
    <div
      aria-label={`Time remaining: ${Math.ceil(timeLeft / 1000)} seconds`}
      className={s.container}
    >
      <div className={s.bar} style={{ width: `${width}%` }} />
    </div>
  );
};

export default RegressBar;
