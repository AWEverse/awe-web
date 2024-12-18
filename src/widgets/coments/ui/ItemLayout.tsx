import { Box, BoxProps, Stack } from '@mui/material';

interface RootProps {
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}

const Root: React.FC<BoxProps & RootProps> = props => {
  const { children, startDecorator, endDecorator } = props;

  return (
    <Box
      aria-labelledby="comment-section"
      gap={0.5}
      role="single-comment"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',

        ...props.sx,
      }}
    >
      {startDecorator}
      <Stack gap={0.5}>{children}</Stack>
      {endDecorator}
    </Box>
  );
};

export default { Root };
