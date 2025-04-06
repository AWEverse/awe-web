import { FC, useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import s from "./MainScreen.module.scss";
import LeftMainHeader from "./main/LeftMainHeader";
import LeftChatList from "./main/LeftChatList";
import SearchList from "./search/SearchList";
import LeftHeaderDropdownMenu from "./main/LeftHeaderDropdownMenu";
import { CloseRounded } from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";
import { useStableCallback } from "@/shared/hooks/base";

interface OwnProps {
  className?: string;
}

type ScreenType = "search" | "chat";

const screens = {
  search: SearchList,
  chat: LeftChatList,
};

const variants = {
  initial: {
    opacity: 0,
    y: -15,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: -15,
    opacity: 0,
  },
};

const MainScreen: FC<OwnProps> = ({}) => {
  const [content, setContent] = useState<ScreenType>("chat");

  const switchToChat = useCallback(() => setContent("chat"), []);
  const switchToSearch = useStableCallback(() => setContent("search"));

  const renderBackButton = useMemo(() => {
    return content === "search" ? (
      <IconButton size="medium" onClick={switchToChat}>
        <CloseRounded />
      </IconButton>
    ) : (
      <LeftHeaderDropdownMenu />
    );
  }, [content, switchToChat]);

  const CurrentScreen = screens[content];

  return (
    <div className={s.LeftMainBody}>
      <section className={s.LeftMainHeader}>
        {renderBackButton}
        <LeftMainHeader onFocus={switchToSearch} />
      </section>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={content}
          className={s.LeftMainContent}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.125 }}
        >
          <CurrentScreen />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default memo(MainScreen);
