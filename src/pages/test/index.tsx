import ContextMenu from "@/entities/context-menu/public/ContextMenu";
import { EMouseButton } from "@/lib/core";
import useContextMenuHandlers from "@/shared/hooks/DOM/useContextMenu";
import useMenuPosition, {
  MenuPositionOptions,
} from "@/shared/hooks/DOM/useMenuPosition";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import { useState, useRef } from "react";

const TestPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isContextMenuOpen,
    contextMenuAnchor,
    contextMenuTarget,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
    handleContextMenuHide,
  } = useContextMenuHandlers(containerRef, false);

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === EMouseButton.Secondary) {
        handleBeforeContextMenu(e);
      }

      if (e.type === "mousedown" && e.button !== EMouseButton.Main) {
        return;
      }
    },
  );

  console.log(contextMenuAnchor);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      style={{ height: "100vh", padding: 20 }}
    >
      <p>Right-click or long-press here to open the context menu.</p>

      <ContextMenu
        rootRef={containerRef}
        isOpen={isContextMenuOpen}
        position={contextMenuAnchor!}
        onClose={handleContextMenuClose}
      >
        <div style={{ padding: "8px" }}>
          <p>Context Menu</p>
          <button onClick={handleContextMenuClose}>Close</button>
        </div>
      </ContextMenu>
    </div>
  );
};

export default TestPage;
