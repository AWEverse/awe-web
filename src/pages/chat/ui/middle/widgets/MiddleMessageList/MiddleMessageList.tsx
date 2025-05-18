import React, { FC, memo, useEffect, useRef } from "react";

import "./MiddleMessageList.scss";
import ChatMessage from "../../message";
import { ScrollProvider } from "@/shared/context";
import { useStableCallback } from "@/shared/hooks/base";
import { useDebouncedFunction } from "@/shared/hooks/shedulers";
import { debounce, EMouseButton } from "@/lib/core";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import ContextMenu, { useContextMenuHandlers } from "@/entities/context-menu";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";

interface OwnProps {}

interface StateProps {}

type MessagePosition = "First" | "Lasts";
const THRESHOLD = 15;

const MiddleMessageList: FC<OwnProps & StateProps> = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [readySignal, setReadySignal] = useStateSignal(true);

  const debouncedHandleScroll = useDebouncedFunction((e: Event) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;

    const isActive = Math.abs(scrollTop) > THRESHOLD;

    if (bottomRef.current) {
      bottomRef.current.classList.toggle("bottom-active", isActive);
    }
  }, 250);

  useComponentDidMount(() => {
    const container = containerRef.current!;

    container.addEventListener(
      "scroll",
      debouncedHandleScroll as EventListener,
    );

    return () =>
      container.removeEventListener(
        "scroll",
        debouncedHandleScroll as EventListener,
      );
  });

  const {
    isContextMenuOpen,
    contextMenuAnchor,
    contextMenuTarget,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
  } = useContextMenuHandlers({
    elementRef: containerRef,
    readySignal,
    targets: ['[data-ctx="true"]'],
  });

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === EMouseButton.Secondary) {
        handleBeforeContextMenu(e);
      }
    },
  );

  return (
    <>
      <ScrollProvider containerRef={containerRef}>
        <div
          ref={containerRef}
          id="chat-scroll-area"
          data-scrolled="true"
          className={
            "MiddleMessageList allow-space-right-column-messages right-column-transition-transform"
          }
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
        >
          {Array.from({ length: 20 }).map((_, index) => (
            <ChatMessage
              isOwn={index % 3 === 0}
              key={index}
              message={{ content: { text: `${index + 1}) message` } }}
              threadId={""}
              messageListType={"thread"}
              noComments={false}
              noReplies={false}
              isJustAdded={false}
              memoFirstUnreadIdRef={{
                current: undefined,
              }}
              accessibleList={function (): boolean {
                throw new Error("Function not implemented.");
              }}
              IsFirstGroup={false}
              IsFirstDocument={false}
              IsFirstList={false}
              IsLastGroup={false}
              IsLastDocument={false}
              IsLastList={false}
            />
          ))}
        </div>
      </ScrollProvider>

      <div ref={bottomRef} className="bottom-marker" />

      <ContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuAnchor!}
        onClose={handleContextMenuClose}
        withPortal
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

export default memo(MiddleMessageList);
