import { FC, PropsWithChildren, useRef } from "react";
import "./ChatLayout.scss";
import buildClassName from "@/shared/lib/buildClassName";
import useChatStore from "@/pages/chat/store/state/useChatState";

const Root: FC<PropsWithChildren> = ({ children }) => {
  const { isRightPanelOpen } = useChatStore();

  return (
    <div
      className={buildClassName(
        "ChatLayoutRoot",
        isRightPanelOpen && "is-right-column-active",
      )}
      aria-label="Chat application container"
    >
      {children}
    </div>
  );
};

const MainContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <section
      aria-label="Chat scrollable content"
      className={"ChatLayoutMiddleWrapper"}
      role="region"
      aria-live="polite"
    >
      {children}
    </section>
  );
};

export default { Root, MainContainer };
