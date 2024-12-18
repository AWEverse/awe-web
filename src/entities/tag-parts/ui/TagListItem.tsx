import { Typography, TypographyProps } from '@mui/material';

interface TagListItemProps extends TypographyProps {}

const TagListItem: React.FC<TagListItemProps> = props => {
  const { children, sx, ...other } = props;

  return (
    <Typography
      className="Tag"
      component="li"
      color="text.secondary"
      variant="caption"
      sx={{
        '&:hover': { textDecoration: 'underline' },
        display: 'inline-flex',
        alignItems: 'center',
        ...sx,
      }}
      {...other}
    >
      {children}
    </Typography>
  );
};

export default TagListItem;
