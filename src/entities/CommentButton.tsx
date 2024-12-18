import { Circle as CircleIcon } from '@mui/icons-material';
import { Stack, Typography, StackProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';

interface CommentButtonProps extends PropsWithChildren {
  sx?: StackProps['sx'];
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  onClick?: () => void;
}

const CommentButton: React.FC<CommentButtonProps> = ({ sx = {}, startDecorator, endDecorator, children, onClick }) => {
  return (
    <Stack
      component="button"
      direction="row"
      gap={1}
      role="button"
      sx={{
        position: 'relative',
        width: '100%',
        p: 0.25,
        pl: 1,
        display: 'flex',
        alignItems: 'center',
        borderBottomRightRadius: 'var(--Message-Border-Radius)',
        '&:hover': {
          backgroundColor: 'background.level1',
        },
        ...sx,
      }}
      onClick={onClick}
    >
      {startDecorator}
      <Typography endDecorator={<CircleIcon color="primary" sx={{ fontSize: 10 }} />}>{children}</Typography>
      {endDecorator}
    </Stack>
  );
};

export default CommentButton;
