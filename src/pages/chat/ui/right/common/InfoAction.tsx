import { FC, memo, ReactNode } from "react";
import s from "./InfoAction.module.scss";
import buildClassName from "@/shared/lib/buildClassName";

interface InfoActionProps {
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const InfoAction: FC<InfoActionProps> = ({
  className,
  title = "Title",
  subtitle = "Subtitle",
  startDecorator,
  endDecorator,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      aria-label={`Copy ${title}`}
      className={buildClassName(
        s.ActionWrapper,
        className,
        disabled && s.Disabled,
      )}
      role="button"
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {startDecorator && <span className={s.Decorator}>{startDecorator}</span>}
      <div className={s.Container}>
        <h3 className={s.Title}>{title}</h3>
        {subtitle && <span className={s.Subtitle}>{subtitle}</span>}
      </div>
      {endDecorator && <span className={s.Decorator}>{endDecorator}</span>}
    </button>
  );
};

export default memo(InfoAction);
