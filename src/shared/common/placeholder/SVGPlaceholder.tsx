import { PropsWithChildren } from 'react';
import { IconProps } from '../../types/icon-types';

const SVGPlaceholder = (props: PropsWithChildren<IconProps>) => {
  const {
    children,
    size = 18,
    className,
    title,
    color = 'inherit',
    description,
    fill = 'currentColor',
    checked = false,
    ...otherProps
  } = props;

  return (
    <svg
      aria-label={title}
      className={className}
      color={color}
      fill={checked ? fill : 'none'}
      height={size}
      role="img"
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...otherProps}
    >
      <title>{title}</title>
      <desc>{description}</desc>
      {children}
    </svg>
  );
};

export default SVGPlaceholder;
