import React, { FC, memo, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import buildClassName from "../lib/buildClassName";
import "./Tab.scss";
import { useFastClick } from "../hooks/mouse/useFastClick";
import { capitalize } from "@/lib/utils/helpers/string/stringFormaters";
import { EMouseButton } from "@/lib/core";
import ContextMenu, {
  ContextMenuOptionType,
  useContextMenuHandlers,
} from "@/entities/context-menu";
import ActionButton from "./ActionButton";

type OwnProps = {
  layoutId: string;
  className?: string;
  title: string;
  isActive?: boolean;
  isBlocked?: boolean;
  badgeCount?: number;
  isBadgeActive?: boolean;
  clickArg?: number;
  variant: "folders" | "pannels" | "fill";
  tabIndex?: number;
  onClick?: (arg: number) => void;
  contextMenuOptions?: ContextMenuOptionType<number>[];
};

const classNames = {
  active: "Tab-active",
  badgeActive: "Tab-badge-active",
};

// Optimized animation settings
const TRANSITION_SETTINGS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  restDelta: 0.001, // Helps determine when animation is "done" - smaller values are more precise but may take longer
};

// Animation variants for better performance
const platformVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Badge animation variants
const badgeVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

const Tab: FC<OwnProps> = ({
  layoutId,
  className,
  title,
  isActive,
  isBlocked,
  badgeCount,
  isBadgeActive,
  onClick,
  clickArg,
  variant = "pannels",
  tabIndex = 0,
  contextMenuOptions,
}) => {
  const tabRef = useRef<HTMLButtonElement>(null);
  const shouldRenderContextMenu =
    contextMenuOptions && contextMenuOptions.length > 0;

  const renderBadge = useMemo(() => {
    if (badgeCount) {
      return (
        <motion.span
          aria-label={`Notifications: ${badgeCount}`}
          className={buildClassName(
            "badge",
            isBadgeActive && classNames.badgeActive,
          )}
          role="alert"
          variants={badgeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          // Using layoutId for consistent animation when badge count changes
          layoutId={`badge-${layoutId}`}
        >
          {badgeCount}
        </motion.span>
      );
    }
    return null;
  }, [badgeCount, isBadgeActive, layoutId]);

  const {
    isContextMenuOpen,
    contextMenuAnchor,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuHide,
    handleContextMenuClose,
  } = useContextMenuHandlers({
    elementRef: tabRef,
    isMenuDisabled: !shouldRenderContextMenu,
  });

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!shouldRenderContextMenu && e.button === EMouseButton.Secondary) {
        handleBeforeContextMenu(e);
      }

      if (e.type === "mousedown" && e.button !== EMouseButton.Main) {
        return;
      }

      onClick?.(clickArg!);
    },
  );

  return (
    <>
      <button
        ref={tabRef}
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
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
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
            <motion.i
              aria-hidden="true"
              className="icon icon-lock-badge blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
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
      </button>

      {contextMenuOptions && contextMenuOptions.length > 0 && (
        <ContextMenu
          isOpen={isContextMenuOpen}
          position={contextMenuAnchor!}
          onClose={handleContextMenuClose}
          onCloseAnimationEnd={handleContextMenuHide}
          withPortal
        >
          <ActionButton size="sm" fullWidth>
            Edit folder
          </ActionButton>

          <ActionButton color="error" variant="text" size="sm" fullWidth>
            Remove folder
          </ActionButton>
        </ContextMenu>
      )}
    </>
  );
};

export default memo(Tab);
export type { OwnProps as TabProps };
