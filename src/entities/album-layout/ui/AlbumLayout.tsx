import React, { FC } from 'react';
import s from './AlbumLayout.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import buildStyle from '@/shared/lib/buildStyle';

type Variants = 'pyramid' | 'stack' | 'square' | 'quilted' | 'woven' | 'masonry';
type Directions = 'left' | 'right' | 'top' | 'bottom';

type Variant = `${Variants}-${Directions}` | Variants;

type Size = `${number}x${number}`;

const classPair: Record<Variants, string> = {
  square: s.AlbumSquare,
  masonry: s.AlbumMasonry,
  stack: s.AlbumStack,
  quilted: s.AlbumQuilted,
  woven: s.AlbumWoven,
  pyramid: s.AlbumPyramid, // Assuming you have this class in your CSS
};

function parseSize(size: Size) {
  const [rows, columns] = size.split('x').map(Number);
  return { rows, columns };
}

interface OwnProps {
  variant: Variant;
  children: React.ReactNode;
  size?: Size;
  gap?: number;
  className?: string;
}

const AlbumLayout: FC<OwnProps> = ({ variant, children, size = '5x5', gap = 10, className = '' }) => {
  const { rows, columns } = parseSize(size);
  const baseVariant = variant.split('-')[0] as Variants;
  const variantClass = classPair[baseVariant];

  const classNames = buildClassName(variantClass, className);
  const styles = buildStyle(gap.toString(), rows.toString(), columns.toString());

  return (
    <div className={classNames} style={styles}>
      {children}
    </div>
  );
};

export default AlbumLayout;
