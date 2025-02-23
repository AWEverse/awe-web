import {
  ReactNode,
  MouseEvent,
  memo,
  useCallback,
  useMemo,
  forwardRef,
  ElementType,
  ComponentPropsWithoutRef,
} from "react";
import buildClassName from "../lib/buildClassName";
import RippleEffect from "./ripple-effect";
import "./ActionButton.scss";

export type SizeVariant =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | `custom-${"xs" | "sm" | "md" | "lg" | "xl"}`;

export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "inherit";

export type ButtonVariant = "contained" | "outlined" | "text" | "icon";

export interface ActionButtonProps extends ComponentPropsWithoutRef<"button"> {
  as?: ElementType;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  label?: string;
  labelClassName?: string;
  variant?: ButtonVariant;
  size?: SizeVariant;
  color?: ColorVariant;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  ripple?: boolean;
  href?: string;
  tabIndex?: number;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
}

const ActionButton = forwardRef<HTMLElement, ActionButtonProps>(
  (props, ref) => {
    const {
      as: Component = "button",
      onClick,
      title,
      active = false,
      disabled = false,
      className,
      icon,
      label,
      labelClassName,
      variant = "contained",
      size = "md",
      color = "primary",
      loading = false,
      fullWidth = true,
      children,
      startDecorator,
      endDecorator,
      ripple = true,
      ...rest
    } = props;

    const buttonClassname = useMemo(
      () =>
        buildClassName(
          "button",
          `button--variant--${variant}`,
          `button--size--${size}`,
          `button--color--${color}`,
          active && "active",
          disabled && "disabled",
          loading && "loading",
          fullWidth && "fullWidth",
          className,
        ),
      [variant, size, color, active, disabled, loading, fullWidth, className],
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        if (!disabled && !loading) {
          onClick?.(event);
        }
      },
      [disabled, loading, onClick],
    );

    const content = useMemo(() => {
      if (children) return children;
      return (
        <>
          {startDecorator}
          {icon && <span className="iconWrapper">{icon}</span>}
          {label && (
            <span className={buildClassName("label", labelClassName)}>
              {label}
            </span>
          )}
          {endDecorator}
        </>
      );
    }, [children, label, icon, startDecorator, endDecorator, labelClassName]);

    const ariaProps = useMemo(
      () => ({
        "aria-busy": loading,
        "aria-disabled": disabled,
        "aria-pressed": active,
        "aria-label": rest["aria-label"] || label || title,
        "aria-labelledby": rest["aria-labelledby"],
        "aria-describedby": rest["aria-describedby"],
      }),
      [loading, disabled, active, rest, label, title],
    );

    return (
      <Component
        {...rest}
        ref={ref}
        role={rest.role || (Component === "button" ? undefined : "button")}
        className={buttonClassname}
        title={title}
        onClick={handleClick}
        disabled={disabled || loading}
        {...ariaProps}
      >
        {content}
        {ripple && <RippleEffect />}
        {loading && <div className="loader" aria-hidden="true" />}
      </Component>
    );
  },
);

export default memo(ActionButton, (prevProps, nextProps) =>
  Object.keys(prevProps).every(
    (key) =>
      prevProps[key as keyof ActionButtonProps] ===
      nextProps[key as keyof ActionButtonProps],
  ),
);
