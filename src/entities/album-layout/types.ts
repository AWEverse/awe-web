import { ReactNode, JSX } from 'react';

type Directions = 'left' | 'right' | 'top' | 'bottom';
type AlbumVariants = 'pyramid' | 'stack' | 'square' | 'quilted' | 'woven' | 'masonry';
type AlbumVariant = `${AlbumVariants}-${Directions}` | AlbumVariants;
type AlbumSize = `${number}x${number}`;

interface AlbumCommonProps {
  component?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  cols?: number;
  gap?: number;
  className?: string;
  rowHeight?: 'auto' | number;
}

export type { AlbumVariants, AlbumVariant, AlbumSize, AlbumCommonProps };
