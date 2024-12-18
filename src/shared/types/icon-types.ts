import { SVGProps } from 'react';

export type Dimentions = 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72;

export type IconStyle = 'stroke' | 'duotone' | 'twotone' | 'solid' | 'bulk';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: Dimentions;
  title?: string;
  description?: string;
  shouldRound?: boolean;
  strokeColor?: string;
  checked?: boolean;
  iconStyle?: IconStyle;
}
