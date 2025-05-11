import { FC, memo, ReactNode } from "react";

import s from "./ActionCard.module.scss";

interface OwnProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  closeIcon?: ReactNode;
  className?: string;
}

/**
 * ActionCard component
 * This component is used to display an action card with a title, description, and actions.
 * It is a functional component that accepts children as props.
 * The component is memoized to prevent unnecessary re-renders.
 * The component is styled using CSS classes.
 *  It is a simple example of a React component.
 *  You can customize it as needed.
 *
 * @component
 */
const ActionCard: FC<OwnProps> = ({
  title,
  description,
  actions,
  children,
  onClose,
  closeIcon,
  className,
}) => {
  return (
    <article className={`${s.actionCard}${className ? " " + className : ""}`}>
      {onClose && (
        <button
          className={s.closeButton}
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          {closeIcon ?? <span className={s.closeIcon}>×</span>}
        </button>
      )}
      {title && <h2 className={s.title}>{title}</h2>}
      {description && <div className={s.description}>{description}</div>}
      {children}
      {actions && <div className={s.actions}>{actions}</div>}
    </article>
  );
};

export default memo(ActionCard);
