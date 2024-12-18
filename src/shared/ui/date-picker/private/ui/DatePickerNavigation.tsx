import { ArrowBackIosNewRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import { FC, memo } from 'react';
import s from './DatePickerNavigation.module.scss';
import IconButton from '@/shared/ui/IconButton';

type NavigationProps = {
  month: string;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onZoomToggle: () => void;
};

const DatePickerNavigation: FC<NavigationProps> = ({ month, year, onPrevMonth, onNextMonth, onZoomToggle }) => (
  <div className={s.navigation}>
    <IconButton onClick={onPrevMonth}>
      <ArrowBackIosNewRounded />
    </IconButton>

    <h3 className={s.title} onClick={onZoomToggle}>
      {month} {year}
    </h3>

    <IconButton onClick={onNextMonth}>
      <ArrowForwardIosRounded />
    </IconButton>
  </div>
);

export default memo(DatePickerNavigation);
