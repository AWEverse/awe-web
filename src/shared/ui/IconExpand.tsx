import { FC, ReactNode } from "react";
import buildClassName from "../lib/buildClassName";
import s from "./IconExpand.module.scss";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

interface OwnProps {
  icon: ReactNode;
  label?: ReactNode;
  checked?: boolean;
}

const IconExpand: FC<OwnProps & DivProps> = ({
  icon,
  label,
  className,
  checked = false,
  onClick,
  ...rest
}) => {
  const classNames = buildClassName(s.iconContainer, className);

  return (
    <div
      className={classNames}
      data-open={checked}
      tabIndex={0}
      onClick={onClick}
      {...rest}
    >
      <span className={s.iconSVG}>{icon}</span>
      <span className={s.iconLabel}>{label}</span>
    </div>
  );
};

export default IconExpand;
