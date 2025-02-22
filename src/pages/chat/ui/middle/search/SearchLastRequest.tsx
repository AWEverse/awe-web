import { FC, memo, useRef } from "react";

import s from "./SearchLastRequest.module.scss";

import { CloseRounded, HistoryRounded } from "@mui/icons-material";
import RippleEffect from "@/shared/ui/ripple-effect";
import buildClassName from "@/shared/lib/buildClassName";
import IconButton from "@/shared/ui/IconButton";
import ContextMenu, { useContextMenuHandlers } from "@/entities/context-menu";
import { EMouseButton } from "@/lib/core";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";

interface OwnProps {
  body?: string;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  tabIndex?: number;
  onClick?: () => void;
  onClose?: () => void;
}

const SearchLastRequest: FC<OwnProps> = ({
  className,
  body = "Last request is empy.",
  tabIndex = 0,
  onClick,
  onClose,
  active = false,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const classNames = buildClassName(
    s.SearchLastRequest,
    className,
    active && !disabled && s.active,
    disabled && s.disabled,
  );

  const {
    isContextMenuOpen,
    contextMenuAnchor,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
  } = useContextMenuHandlers(containerRef, false, false, false);

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === EMouseButton.Secondary) {
        handleBeforeContextMenu(e);
      }
    },
  );

  return (
    <>
      <div
        ref={containerRef}
        role="button"
        tabIndex={tabIndex}
        className={classNames}
        onClick={(e) => {
          handleClick?.(e);
          onClick?.();
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        <HistoryRounded fontSize="small" />

        <p>{body}</p>

        <IconButton
          className={s.close}
          size="small"
          onClick={onClose}
          tabIndex={-1}
        >
          <CloseRounded fontSize="small" />
        </IconButton>

        <RippleEffect />
      </div>

      <ContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuAnchor!}
        onClose={handleContextMenuClose}
        withPortal
        menuClassName="p-2"
      >
        <p>Reply</p>
        <p>Copy</p>
        <p>Copy link</p>
        <p>Forward</p>
        <p>Reporst</p>
      </ContextMenu>
    </>
  );
};

export default memo(SearchLastRequest);
