import { styled } from '@mui/material';

const Root = styled('div', { name: 'JoyImageMessage', slot: 'root' })({
  display: 'block',
  maxWidth: '480px',
  maxHeight: '270px',
  borderRadius: '14px',
});

const Img = styled('img', { name: 'JoyImageMessage', slot: 'img' })({
  borderRadius: '14px',
  objectFit: 'cover',
  height: '100%',
  width: '100%',
  display: 'block',
});

const Image = () => {
  return (
    <Root>
      <Img src="https://i.pinimg.com/originals/2a/2e/2b/2a2e2b063d6b455e33cffbe1fcb3251c.gif" />
    </Root>
  );
};

export { Image };
