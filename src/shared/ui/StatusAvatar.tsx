import Badge from '@mui/material/Badge';
import Avatar, { AvatarProps } from '@mui/material/Avatar';

type StatusAvatarProps = AvatarProps & {
  online?: boolean;
};

export default function StatusAvatar(props: StatusAvatarProps) {
  const { online = false, ...other } = props;
  const color = online ? 'success' : 'neutral';
  const variant = online ? 'solid' : 'soft';

  return (
    <Badge
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeInset="6px 6px"
      color={color}
      size="sm"
      variant={variant}
    >
      <Avatar size="md" {...other} />
    </Badge>
  );
}
