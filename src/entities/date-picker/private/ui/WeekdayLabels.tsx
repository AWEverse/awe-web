import { FC, memo } from "react";
import { WEEKDAY_LETTERS } from "../lib/constans";

interface WeekdayLabelsProps {}

const WeekdayLabels: FC<WeekdayLabelsProps> = ({}) => {
  return (
    <div className="dp-weekdays">
      {WEEKDAY_LETTERS.map((weekday) => (
        <div key={weekday} className="dp-weekday">
          {weekday}
        </div>
      ))}
    </div>
  );
};

export default memo(WeekdayLabels);
