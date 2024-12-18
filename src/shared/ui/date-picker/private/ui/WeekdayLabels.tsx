import { FC, memo } from 'react';
import { WEEKDAY_LETTERS } from '../lib/constans';

interface WeekdayLabelsProps {
  formatMessage: (opts: { id: string }) => string;
}

const WeekdayLabels: FC<WeekdayLabelsProps> = ({ formatMessage }) => {
  return (
    <div className="weekdays">
      {WEEKDAY_LETTERS.map(weekday => (
        <div key={weekday} className="weekday">
          {formatMessage({ id: weekday }).slice(0, 2)}
        </div>
      ))}
    </div>
  );
};

export default memo(WeekdayLabels);
