import React, { FC, memo, useMemo, useRef } from "react";
import { motion } from "framer-motion";
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

const TRANSITION_SETTINGS = { type: "spring", stiffness: 500, damping: 30 };

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
  const shoudlRenderContextMenu =
    contextMenuOptions && contextMenuOptions.length > 0;

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
  } = useContextMenuHandlers(tabRef, shoudlRenderContextMenu, false, false);

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!shoudlRenderContextMenu && e.button === EMouseButton.Secondary) {
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
              transition={TRANSITION_SETTINGS}
            >
              <span className="platform-inner-pannels" />
            </motion.i>
          )}
        </span>
      </button>

      {contextMenuOptions && contextMenuOptions.length > 0 && (
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
      )}
    </>
  );
};

export default memo(Tab);
export type { OwnProps as TabProps };
