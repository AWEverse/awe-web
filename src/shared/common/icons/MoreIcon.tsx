import { memo } from 'react';
import SVGPlaceholder from '../placeholder/SVGPlaceholder';
import { IconProps } from '../../types/icon-types';

type OwnProps = {
  direction?: 'horizontal' | 'vertical' | 'h' | 'v';
} & IconProps;

const MoreIcon = memo(
  ({
    direction = 'horizontal',
    strokeColor = 'currentColor',
    strokeWidth = 4,
    shouldRound = true,
    strokeLinejoin,
    strokeLinecap,
    ...props
  }: OwnProps) => {
    const isHorizontal = direction === 'horizontal' || direction === 'h';

    const paths = isHorizontal
      ? ['M11.9959 12H12.0049', 'M17.9998 12H18.0088', 'M5.99981 12H6.00879']
      : ['M11.992 12H12.001', 'M11.9842 18H11.9932', 'M11.9998 6H12.0088'];

    const renderPath = paths.map((path, index) => (
      <path
        key={index}
        d={path}
        stroke={strokeColor}
        strokeLinecap={shouldRound ? 'round' : strokeLinecap}
        strokeLinejoin={shouldRound ? 'round' : strokeLinejoin}
        strokeWidth={strokeWidth}
      />
    ));

    return <SVGPlaceholder {...props}>{renderPath}</SVGPlaceholder>;
  },
);

export default MoreIcon;
