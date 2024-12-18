import { resizeImage } from '@/lib/utils/helpers/image/ImageResize';
import { styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { CircularProgress, Box, Link } from '@mui/material';

const Root = styled('div', { name: 'JoySticker', slot: 'root' })({
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'inherit',
  maxWidth: '200px',
  maxHeight: '200px',
  cursor: 'pointer',

  // filter: "blur(2px)",
  // opacity: 0.5,
  // transition: "0.6s ease all",

  // transform: "perspective(200px)  scale(0.9) rotateX(-10deg) scale(0.75)",

  // "&:hover": {
  //   transform:
  //     "perspective(200px) rotateY(0deg) translateY(0px) rotateX(0deg) scale(1)",
  //   filter: "blur(0)",
  //   opacity: 1,
  // },
});

const StyledImg = styled('img', { name: 'JoySticker', slot: 'img' })({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
});

interface OwnProps {
  src?: string;
  sx?: React.CSSProperties;
  imgSx?: React.CSSProperties;
  reverse?: boolean;
}

type StickerProps = OwnProps;

const Sticker: React.FC<StickerProps> = ({ sx, imgSx, src }) => {
  const [resizedImgUrl, setResizedImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchResizedImage = async () => {
      try {
        setLoading(true);
        if (src) {
          const url = await resizeImage('src/assets/bg.jpg', 200, 200, 'image/png');
          setResizedImgUrl(url);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResizedImage();

    return () => {
      setResizedImgUrl(null);
    };
  }, [src]);

  return (
    <Root sx={sx}>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            mr: 6,
          }}
        >
          <Link component="button" startDecorator={<CircularProgress />} sx={{ p: 1 }} variant="plain">
            Submitting...
          </Link>
        </Box>
      ) : (
        <StyledImg src={resizedImgUrl || 'https://picsum.photos/200'} sx={imgSx} />
      )}
    </Root>
  );
};

export { Sticker };
