import { styled } from '@mui/material';
import { SxProps } from '@mui/material/styles/types';
import MessageTimeSend from '../MessageTimeSend';

const Root = styled('span', { name: 'JoySticker', slot: 'root' })({
  display: 'inline',
  lineHeight: '1.3125',
  fontSize: '16px',
  fontWeight: '400',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  hyphens: 'manual',
});

interface OwnProps {
  children: React.ReactNode;
  sx?: SxProps;
}

const Text: React.FC<OwnProps> = props => {
  const { children, sx } = props;

  return (
    <Root dir="auto" sx={sx}>
      {children}
      <MessageTimeSend isSent unread startDecorator={<span>edited</span>} timestamp={'9:00'} />
    </Root>
  );
};

export { Text };
