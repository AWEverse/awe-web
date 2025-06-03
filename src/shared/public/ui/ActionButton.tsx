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
      fullWidth = false, // Changed default to false for better usability
      children,
      startDecorator,
      endDecorator,
      ripple = true,
      href,
      ...rest
    } = props;

    // Performance optimization: Use object for className generation to avoid array operations
    const buttonClassname = useMemo(() => {
      const classes = {
        button: true,
        [`button--variant--${variant}`]: true,
        [`button--size--${size}`]: true,
        [`button--color--${color}`]: true,
        active,
        disabled,
        loading,
        fullWidth,
        [className || ""]: !!className,
      };
      return buildClassName(classes);
    }, [variant, size, color, active, disabled, loading, fullWidth, className]);

    // Optimized click handler with href support
    const handleClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        if (disabled || loading) {
          event.preventDefault();
          return;
        }

        if (href) {
          // Handle href navigation for custom elements
          const linkClick =
            !event.ctrlKey && !event.metaKey && event.button === 0;
          if (linkClick) {
            event.preventDefault();
            window.location.href = href;
          }
        }

        onClick?.(event);
      },
      [disabled, loading, onClick, href],
    );

    // Optimized content generation
    const content = useMemo(() => {
      if (children) return children;

      const hasDecorators = startDecorator || endDecorator;
      const hasIcon = icon || hasDecorators;

      return (
        <>
          {startDecorator}
          {icon && (
            <span
              className={buildClassName("iconWrapper", {
                "iconWrapper--with-label": !!label,
              })}
            >
              {icon}
            </span>
          )}
          {label && (
            <span
              className={buildClassName("label", labelClassName, {
                "label--with-icon": !!hasIcon,
              })}
            >
              {label}
            </span>
          )}
          {endDecorator}
        </>
      );
    }, [children, label, icon, startDecorator, endDecorator, labelClassName]);

    // Optimized ARIA props
    const ariaProps = useMemo(
      () => ({
        "aria-busy": loading,
        "aria-disabled": disabled,
        "aria-pressed": active,
        "aria-label": rest["aria-label"] || label || title,
        "aria-labelledby": rest["aria-labelledby"],
        "aria-describedby": rest["aria-describedby"],
        role: rest.role || (Component === "button" ? undefined : "button"),
      }),
      [loading, disabled, active, rest, label, title, Component],
    );

    return (
      <Component
        {...rest}
        ref={ref}
        className={buttonClassname}
        title={title}
        onClick={handleClick}
        disabled={disabled || loading}
        {...ariaProps}
        {...(href && { href })}
      >
        {content}
        {ripple && !disabled && !loading && <RippleEffect />}
        {loading && (
          <div className="loader" aria-hidden="true">
            <div className="loader__spinner" />
          </div>
        )}
      </Component>
    );
  },
);

// Deep comparison memoization for better performance
export default memo(ActionButton, (prevProps, nextProps) => {
  const prevKeys = Object.keys(prevProps) as (keyof ActionButtonProps)[];
  return prevKeys.every((key) => prevProps[key] === nextProps[key]);
});
