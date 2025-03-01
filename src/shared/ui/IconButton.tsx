import { FC, MouseEvent, ReactNode, ButtonHTMLAttributes, memo } from "react";
import s from "./IconButton.module.scss";
import buildClassName from "../lib/buildClassName";
import RippleEffect from "./ripple-effect";

interface OwnSharedProps {
  variant?: "outlined" | "plain";
  size?: "small" | "medium" | "large" | "bigger" | "jumbo";
}

interface OwnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?:
    | ((event: MouseEvent<HTMLButtonElement>) => void)
    | NoneToVoidFunction;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

const IconButton: FC<OwnProps & OwnSharedProps> = ({
  children,
  onClick,
  title,
  active = false,
  disabled = false,
  className,
  variant = "plain",
  size = "medium",
  ...buttonProps
}) => {
  const buttonClassName = buildClassName(
    s.iconButton,
    s[variant],
    s[size],
    active && s.active,
    disabled && s.disabled,
    className,
  );

  return (
    <button
      aria-pressed={active}
      className={buttonClassName}
      disabled={disabled}
      title={title}
      onClick={onClick}
      {...buttonProps}
    >
      {children}
      <RippleEffect />
    </button>
  );
};

export const IconButtonMemo = memo(IconButton);
export default IconButton;
export type { OwnSharedProps as IconButtonSharedProps };
