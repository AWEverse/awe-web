import CircleIcon from '@mui/icons-material/Circle';

type UnreadIconProps = {
  unread?: boolean;
};

export const UnreadIcon: React.FC<UnreadIconProps> = () => <CircleIcon color="primary" sx={{ fontSize: 12 }} />;
