import SVGPlaceholder from '../placeholder/SVGPlaceholder';
import { IconProps } from '../../types/icon-types';

const ArrowTurnBackwardIcon = ({
  strokeWidth = 2,
  strokeColor = 'currentColor',
  strokeLinejoin = 'round',
  strokeLinecap = 'round',
  ...props
}: IconProps) => (
  <SVGPlaceholder {...props}>
    <path
      d="M11 6H15.5C17.9853 6 20 8.01472 20 10.5C20 12.9853 17.9853 15 15.5 15H4"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <path
      d="M6.99998 12C6.99998 12 4.00001 14.2095 4 15C3.99999 15.7906 7 18 7 18"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
  </SVGPlaceholder>
);

export default ArrowTurnBackwardIcon;
