import { FC, memo } from "react";
import I18n from "@/shared/ui/i18n";

interface WeekdayLabelsProps {}

const TOTAL_CELL_COUNT = 7;
const WEEK_ABBR_LENGTH = 3;

const WeekdayLabels: FC<WeekdayLabelsProps> = ({}) => {
  return (
    <div className="dp-weekdays">
      {Array.from({ length: TOTAL_CELL_COUNT }, (_, i) => (
        <div key={`time.weekdays.${i}`} className="dp-weekday">
          <I18n
            i18nKey={`time.weekdays.${i}`}
            manipulations={(s) => s.substring(0, WEEK_ABBR_LENGTH)}
          />
        </div>
      ))}
    </div>
  );
};

export default memo(WeekdayLabels);
