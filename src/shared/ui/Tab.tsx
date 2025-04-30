import React, { FC, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import buildClassName from "../lib/buildClassName";
import { Link } from "react-router";
import "./Tab.scss";
import { capitalize } from "@/lib/utils/helpers/string/stringFormaters";

type TabVariant = "folders" | "panels" | "fill";

type OwnProps = {
  layoutId: string;
  className?: string;
  href?: string;
  title: string;
  isActive?: boolean;
  isBlocked?: boolean;
  badgeCount?: number;
  badgeMax?: number;
  isBadgeActive?: boolean;
  clickArg?: number;
  variant?: TabVariant;
  tabIndex?: number;
  onClick?: (arg: number) => void;
};

const TRANSITION_SETTINGS = {
  type: "spring",
  stiffness: 400,
  damping: 24,
  mass: 0.5,
  restDelta: 0.001,
};

const platformVariants = {
  initial: { opacity: 0, scaleX: 0.9, scaleY: 0.9 },
  animate: { opacity: 1, scaleX: 1, scaleY: 1 },
  exit: { opacity: 0, scaleX: 0.9, scaleY: 0.95 },
};

const Tab: FC<OwnProps> = ({
  layoutId,
  className,
  href,
  title,
  isActive,
  isBlocked,
  badgeCount,
  badgeMax,
  isBadgeActive,
  clickArg = 0,
  variant = "panels",
  tabIndex = 0,
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(clickArg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      handleClick();
    }
  };

  const renderBadge = useMemo(() => {
    if (badgeCount === undefined) return null;

    const displayCount =
      badgeMax && badgeCount > badgeMax ? `${badgeMax}+` : badgeCount;

    return (
      <span
        aria-label={`Notifications: ${displayCount}`}
        className={buildClassName("badge", isBadgeActive && "Tab-badge-active")}
        role="alert"
      >
        {displayCount}
      </span>
    );
  }, [badgeCount, badgeMax, isBadgeActive]);

  const platformClass = useMemo(
    () => buildClassName("platform", `platform-${variant}`),
    [variant],
  );

  const tabProps = {
    "aria-label": title,
    "aria-selected": isActive,
    className: buildClassName(
      "Tab",
      onClick && "Tab-interactive",
      isActive && "Tab-active",
      className,
    ),
    role: "tab",
    tabIndex,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  const tabContent = (
    <motion.span
      className={buildClassName("TabInner", capitalize(variant))}
      data-active={isActive}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
    >
      <span className="Tab-title">{title}</span>
      {renderBadge}
      {isBlocked && (
        <i aria-hidden="true" className="icon icon-lock-badge blocked" />
      )}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.i
            key={`${layoutId}-${variant}`}
            layoutId={layoutId}
            className={platformClass}
            transition={TRANSITION_SETTINGS}
            variants={platformVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <span className={`platform-inner-${variant}`} />
          </motion.i>
        )}
      </AnimatePresence>
    </motion.span>
  );

  return href ? (
    <Link {...tabProps} to={href}>
      {tabContent}
    </Link>
  ) : (
    <button {...tabProps} type="button">
      {tabContent}
    </button>
  );
};

export default memo(Tab);
export type { OwnProps as TabProps };
