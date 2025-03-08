import { FC, PropsWithChildren, useRef } from "react";
import "./ChatLayout.scss";
import buildClassName from "@/shared/lib/buildClassName";
import useChatStore from "@/pages/chat/store/state/useChatState";

const Root: FC<PropsWithChildren> = ({ children }) => {
  return (
    <main
      className={"ChatLayoutRoot"}
      role="main"
      aria-label="Chat application"
    >
      {children}
    </main>
  );
};

const Main: FC<PropsWithChildren> = ({ children }) => {
  const mainRef = useRef<HTMLDivElement>(null);

  const { isRightPanelOpen } = useChatStore();

  return (
    <section
      ref={mainRef}
      className={buildClassName(
        "ChatLayoutBody",
        isRightPanelOpen && "is-right-column-active",
      )}
      role="region"
      aria-label="Chat main content"
    >
      {children}
    </section>
  );
};

const Footer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <footer
      className={"ChatLayoutFooter"}
      role="contentinfo"
      aria-label="Chat footer"
    >
      {children}
    </footer>
  );
};

const MainContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <section
      aria-label="Chat scrollable content"
      className={"ChatLayoutMiddleWrapper"}
      role="region"
    >
      {children}
    </section>
  );
};

export default { Root, Main, Footer, MainContainer };
