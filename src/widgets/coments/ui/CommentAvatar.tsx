import { Avatar } from '@mui/material';
import { VerticalDivider } from '../../../shared/ui/Divider';

export interface AvatarProps {
  src?: string;
  onClick?: () => void;
}

const CommentAvatar: React.FC<AvatarProps> = ({ src, onClick }) => {
  return (
    <VerticalDivider separatorposition={0} onClick={onClick}>
      <Avatar
        src={src}
        sx={{
          zIndex: 10,
          width: 24,
          height: 24,
          mt: 0.1,
          position: 'sticky',
          top: 'calc(var(--ShowcaseHeaderHeight) + 3px)',

          '&:hover': {
            cursor: 'pointer',
            borderColor: 'primary.300',
          },
        }}
        variant="outlined"
      />
    </VerticalDivider>
  );
};

export default CommentAvatar;
