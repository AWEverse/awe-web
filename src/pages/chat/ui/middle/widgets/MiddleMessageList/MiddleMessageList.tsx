import React, { FC, memo, useRef } from "react";

import "./MiddleMessageList.scss";
import ChatMessage from "../../message";
import { ScrollProvider } from "@/shared/context";
import {
  useDebouncedFunction,
  useThrottledFunction,
} from "@/shared/hooks/shedulers";
import { throttle } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import { requestNextMutation } from "@/lib/modules/fastdom";

interface OwnProps {}

interface StateProps {}

type MessagePosition = "First" | "Lasts";
const THRESHOLD = 15;

const MiddleMessageList: FC<OwnProps & StateProps> = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useStableCallback((e: React.UIEvent) => {
    const currentTarget = e.currentTarget;
    const scrollTop = currentTarget.scrollTop;

    const isActive = Math.abs(scrollTop) > THRESHOLD;

    if (bottomRef.current) {
      bottomRef.current.classList.toggle("bottom-active", isActive);
    }
  });

  return (
    <>
      <ScrollProvider containerRef={containerRef}>
        <div
          ref={containerRef}
          id="chat-scroll-area"
          data-scrolled="true"
          className={"MiddleMessageList allow-space-right-column-messages"}
          onScroll={handleScroll}
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
    </>
  );
};

export default memo(MiddleMessageList);
