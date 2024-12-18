import { IconProps } from '@/shared/types/icon-types';
import SVGPlaceholder from '../placeholder/SVGPlaceholder';

const SortByUp02Icon = ({
  strokeWidth = 2,
  strokeColor = 'currentColor',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  ...props
}: IconProps) => (
  <SVGPlaceholder {...props}>
    <path
      d="M3 15L14 14.9999"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <path
      d="M3 9H10"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <path
      d="M3 21H19"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <path
      d="M18.5 3V15M18.5 3C17.7998 3 16.4915 4.9943 16 5.5M18.5 3C19.2002 3 20.5085 4.9943 21 5.5"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
  </SVGPlaceholder>
);

export default SortByUp02Icon;
