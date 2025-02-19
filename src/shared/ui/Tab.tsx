import React, { FC, memo, useImperativeHandle, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import buildClassName from "../lib/buildClassName";
import "./Tab.scss";
import { useFastClick } from "../hooks/mouse/useFastClick";
import { capitalize } from "@/lib/utils/helpers/string/stringFormaters";
import { EMouseButton } from "@/lib/core";
import ContextMenu, { useContextMenuHandlers } from "@/entities/context-menu";
import ActionButton from "./ActionButton";

type OwnProps = {
  ref: React.RefObject<HTMLDivElement | null>;
  layoutId: string;
  className?: string;
  title: string;
  isActive?: boolean;
  isBlocked?: boolean;
  badgeCount?: number;
  isBadgeActive?: boolean;
  previousActiveTab?: number;
  onClick?: (arg: number) => void;
  clickArg?: number;
  variant: "folders" | "pannels" | "fill";
  tabIndex?: number;
  contextRootElementSelector?: string;
};

const classNames = {
  active: "Tab-active",
  badgeActive: "Tab-badge-active",
};

const Tab: FC<OwnProps> = ({
  ref,
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
}) => {
  const tabRef = useRef<HTMLButtonElement>(null);

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
  }, [badgeCount, isBadgeActive]);

  const {
    isContextMenuOpen,
    contextMenuAnchor,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuHide,
    handleContextMenuClose,
  } = useContextMenuHandlers(tabRef, false, false, false);

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.button === EMouseButton.Secondary) {
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
        <span
          className={buildClassName("TabInner", capitalize(variant))}
          data-active={isActive}
        >
          {title}
          {renderBadge}
          {isBlocked && (
            <i aria-hidden="true" className="icon icon-lock-badge blocked" />
          )}

          {isActive && (
            <motion.i
              key={title}
              layoutId={layoutId}
              className={buildClassName("platform", `platform-${variant}`)}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span className="platform-inner-pannels" />
            </motion.i>
          )}
        </span>
      </button>

      <ContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuAnchor!}
        onClose={handleContextMenuClose}
        onCloseAnimationEnd={handleContextMenuHide}
        withPortal
        menuClassName="p-2"
      >
        <ActionButton size="sm" fullWidth>
          Edit folder
        </ActionButton>

        <ActionButton color="error" variant="text" size="sm" fullWidth>
          Remove folder
        </ActionButton>
      </ContextMenu>
    </>
  );
};

export default memo(Tab);
export type { OwnProps as TabProps };
