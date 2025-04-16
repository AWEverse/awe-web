import { createRef, FC, JSX, memo, ReactNode, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import buildClassName from "../lib/buildClassName";
import "./Tab.scss";
import { capitalize } from "@/lib/utils/helpers/string/stringFormaters";

type OwnProps = {
  layoutId: string;
  className?: string;
  href?: string | undefined;
  title: string;
  isActive?: boolean;
  isBlocked?: boolean;
  badgeCount?: number;
  isBadgeActive?: boolean;
  clickArg?: number;
  variant: "folders" | "pannels" | "fill";
  tabIndex?: number;
  onClick?: (arg: number) => void;
};

const classNames = {
  active: "Tab-active",
  badgeActive: "Tab-badge-active",
};

const TRANSITION_SETTINGS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  restDelta: 0.001,
};

const platformVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const Tab: FC<OwnProps> = ({
  layoutId,
  className,
  href,
  title,
  isActive,
  isBlocked,
  badgeCount,
  isBadgeActive,
  onClick,
  clickArg = 0,
  variant = "pannels",
  tabIndex = 0,
}) => {
  const renderBadge = useMemo(() => {
    if (badgeCount) {
      return (
        <span
          aria-label={`Notifications: ${badgeCount}`}
          className={buildClassName(
            "badge",
            isBadgeActive && classNames.badgeActive,
          )}
          role="alert"
        >
          {badgeCount}
        </span>
      );
    }
    return null;
  }, [badgeCount, isBadgeActive, layoutId]);

  const handleClick = () => {
    onClick?.(clickArg);
  };

  const RelativeTag = (href ? "a" : "button") as keyof Pick<
    JSX.IntrinsicElements,
    "a" | "button"
  >;

  return (
    <RelativeTag
      {...(href ? { href } : { type: "button" })}
      aria-label={title}
      aria-selected={isActive}
      className={buildClassName(
        "Tab",
        onClick && "Tab-interactive",
        isActive && classNames.active,
        className,
      )}
      role="tab"
      tabIndex={tabIndex}
      onClick={handleClick}
    >
      <motion.span
        className={buildClassName("TabInner", capitalize(variant))}
        data-active={isActive}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <span className="Tab-title">{title}</span>
        {renderBadge}
        {isBlocked && (
          <i aria-hidden="true" className="icon icon-lock-badge blocked" />
        )}

        <AnimatePresence>
          {isActive && (
            <motion.i
              key={`${title}-active`}
              layoutId={layoutId}
              className={buildClassName("platform", `platform-${variant}`)}
              transition={TRANSITION_SETTINGS}
              variants={platformVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: "transform, opacity" }}
            >
              <span className="platform-inner-pannels" />
            </motion.i>
          )}
        </AnimatePresence>
      </motion.span>
    </RelativeTag>
  );
};

export default memo(Tab);
export type { OwnProps as TabProps };
