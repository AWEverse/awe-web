import { clamp } from '@/lib/core';
import { Divider, DividerProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDivider = styled(Divider, {
  name: 'VerticalDivider',
  slot: 'root',
})(({ theme }) => ({
  '&::before, &::after': {
    width: '3px',
    borderRadius: '4px',
  },
  '&:hover::before, &:hover::after': {
    cursor: 'pointer',
  },
  '&::after': { marginTop: '3px' },
}));

interface VerticalDividerProps {
  separatorposition?: number;
}

const VerticalDivider: React.FC<VerticalDividerProps & DividerProps> = props => {
  const { children, separatorposition = 0 } = props;

  const _separatorPosition = clamp(separatorposition, 0, 100);

  return (
    <StyledDivider
      orientation="vertical"
      sx={{
        '--Divider-childPosition': `${_separatorPosition}%`,
        borderRadius: 'xs',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </StyledDivider>
  );
};

export { VerticalDivider };
