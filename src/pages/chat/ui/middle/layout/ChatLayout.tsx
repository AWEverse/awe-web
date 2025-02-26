import { FC, PropsWithChildren, useEffect, useRef } from "react";

import s from "./ChatLayout.module.scss";
import useChatStore from "@/pages/chat/store/useChatSelector";
import buildStyle from "@/shared/lib/buildStyle";
import { AnimatePresence, motion } from "framer-motion";

const Root: FC<PropsWithChildren> = ({ children }) => {
  const isFooter = useChatStore((state) => state.isFooter);

  return (
    <main
      className={s.ChatContainer}
      role="main"
      aria-label="Chat application"
      style={buildStyle(`--footer-height: ${isFooter ? "22px" : "0px"}`)}
    >
      {children}
    </main>
  );
};

const Main: FC<PropsWithChildren> = ({ children }) => {
  const mainRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={mainRef}
      className={s.Body}
      role="region"
      aria-label="Chat main content"
    >
      {children}
    </section>
  );
};

const Footer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <footer className={s.Footer} role="contentinfo" aria-label="Chat footer">
      {children}
    </footer>
  );
};

const MainContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <section
      aria-label="Chat scrollable content"
      className={s.MainContainer}
      role="region"
      layout
    >
      {children}
    </section>
  );
};

export default { Root, Main, Footer, MainContainer };
