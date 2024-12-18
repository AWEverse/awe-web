import { FC, ReactNode, useCallback, useState } from 'react';
import buildClassName from '@/shared/lib/buildClassName';
import s from './index.module.scss';

interface OwnProps {
  src: string;
  alt: string;
  className?: string;
  figureClassName?: string;
  captionClassName?: string;
  caption?: ReactNode;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  srcSet?: string;
  sizes?: string;
  onError?: () => void;
}

const Img: FC<OwnProps> = props => {
  const {
    src,
    alt,
    className,
    caption,
    fallbackSrc = 'https://via.placeholder.com/150',
    loading = 'lazy',
    srcSet,
    sizes,
    decoding = 'async',
    captionClassName,
    figureClassName,
    onError,
  } = props;

  const [imgSrc, setImgSrc] = useState(src);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);

    onError?.();
  }, [fallbackSrc, onError]);

  return (
    <figure className={buildClassName(s.ImgContainer, figureClassName)}>
      <img
        alt={alt}
        className={buildClassName(s.Img, className)}
        decoding={decoding}
        loading={loading}
        sizes={sizes}
        src={imgSrc}
        srcSet={srcSet}
        onError={handleError}
      />
      {caption && <figcaption className={buildClassName(s.ImgCaption, captionClassName)}>{caption}</figcaption>}
    </figure>
  );
};

export default Img;
