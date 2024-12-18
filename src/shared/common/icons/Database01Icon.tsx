import SVGPlaceholder from '../placeholder/SVGPlaceholder';
import { IconProps } from '../../types/icon-types';

const Database01Icon = ({
  strokeColor = 'currentColor',
  strokeWidth = 2,
  strokeLinejoin = 'round',
  strokeLinecap = 'round',
  ...props
}: IconProps) => (
  <SVGPlaceholder {...props}>
    <path
      d="M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891 5.282 2.5 7.522 2.5 12 2.5s6.718 0 8.109 1.391C21.5 5.282 21.5 7.522 21.5 12s0 6.718-1.391 8.109C18.718 21.5 16.478 21.5 12 21.5s-6.718 0-8.109-1.391C2.5 18.718 2.5 16.478 2.5 12z"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <path
      d="M2.5 12H21.5"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <path
      d="M13 7h4"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <circle
      cx="8.25"
      cy="7"
      r="1.25"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <circle
      cx="8.25"
      cy="17"
      r="1.25"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
    <path
      d="M13 17h4"
      stroke={strokeColor}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
    />
  </SVGPlaceholder>
);

export default Database01Icon;
