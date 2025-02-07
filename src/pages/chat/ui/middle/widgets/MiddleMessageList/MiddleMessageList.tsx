import { FC, memo, useRef } from "react";

import s from "./MiddleMessageList.module.scss";
import useMessageObservers from "./hooks/useMessagesObservers";
import ChatMessage from "../../message";
import { ScrollProvider } from "@/shared/context";

interface OwnProps {}

interface StateProps {}

const MiddleMessageList: FC<OwnProps & StateProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollProvider containerRef={containerRef}>
      <section
        ref={containerRef}
        id="chat-scroll-area"
        data-scrolled="true"
        className={s.MiddleMessageList}
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <ChatMessage
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
            getIsMessageListReady={function (): boolean {
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
      </section>
    </ScrollProvider>
  );
};

export default memo(MiddleMessageList);
