import { Typography } from '@mui/material';

interface ITimeReadProps {
  isRead: boolean;
  timestamp: string;
}

export const TimeRead: React.FC<ITimeReadProps> = ({ isRead, timestamp }) =>
  isRead && (
    <Typography
      level={'body-xs'}
      sx={{
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'row-reverse',
      }}
    >
      Прочитано: {timestamp}
    </Typography>
  );
