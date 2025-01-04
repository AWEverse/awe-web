import { FC, memo, ReactNode, KeyboardEvent } from 'react';
import s from './VideoTopic.module.scss';
import Img from '@/shared/ui/Image';
import buildClassName from '@/shared/lib/buildClassName';
import RippleEffect from '@/shared/ui/ripple-effect';

interface OwnProps {
  id?: string | number;
  direction?: 'vertical' | 'horizontal';
  variant?: 'plain' | 'outlined' | 'soft';
  size?: 'small' | 'medium' | 'large' | 'compact' | 'listItem';
  href?: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  description?: string;
  views?: number;
  author?: string;
  customIcon?: ReactNode;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

const VideoTopic: FC<OwnProps> = ({
  size = 'medium',
  thumbnail,
  direction = 'horizontal',
  variant = 'outlined',
  href,
  alt,
  title,
  description,
  views,
  author,
  // customIcon,
  className,
  onClick,
  onKeyDown,
}) => {
  const isMedium = size === 'medium';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onClick?.();
    }

    onKeyDown?.(e);
  };

  const renderContent = () => (
    <>
      <div className={s.title}>
        <p className={s.titleText}>{title}</p>
      </div>

      {author && <span className={s.meta}>@{author}</span>}
      {isMedium && views && <span className={s.meta}>{views.toLocaleString()} views</span>}

      {description && <p className={s.meta}>{description}</p>}
    </>
  );

  const renderOriented = () =>
    direction === 'horizontal' ? renderContent() : <div>{renderContent()}</div>;

  return (
    <a
      aria-disabled="false"
      aria-label={`Video Topic ${title || ''}`}
      aria-pressed="false"
      className={buildClassName(className, s.VideoTopic)}
      data-direction={direction}
      data-size={size}
      data-variant={variant}
      href={href}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <Img
        alt={alt || 'Video thumbnail'}
        aria-hidden="true"
        className={s.ThumbnailImg}
        figureClassName={s.FigureImg}
        src={thumbnail || 'https://via.placeholder.com/150'}
      />
      {renderOriented()}
      <RippleEffect />
    </a>
  );
};

export default memo(VideoTopic);
export type { OwnProps as VideoTopicProps };
