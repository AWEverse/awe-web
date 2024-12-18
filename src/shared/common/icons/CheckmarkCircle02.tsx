import { IconProps } from '@/shared/types/icon-types';
import SVGPlaceholder from '../placeholder/SVGPlaceholder';

const CheckmarkCircle02Icon = ({
  strokeWidth = 2,
  strokeColor = 'currentColor',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  ...props
}: IconProps) => (
  <SVGPlaceholder {...props}>
    <path
      d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
    <path
      d="M8 12.5L10.5 15L16 9"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
  </SVGPlaceholder>
);

export default CheckmarkCircle02Icon;
