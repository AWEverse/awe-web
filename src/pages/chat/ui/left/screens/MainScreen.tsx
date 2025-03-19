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

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const MainScreen: FC<OwnProps> = ({}) => {
  const [content, setContent] = useState<ScreenType>("chat");
  // const { isButtonVisible, handleMouseEnter, handleMouseLeave } =
  //   useFloatingButton(false);

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
    <div
      className={s.LeftMainBody}
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
    >
      <section className={s.LeftMainHeader}>
        {renderBackButton}
        <LeftMainHeader onFocus={switchToSearch} />
      </section>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={content}
          className={s.LeftMainContent}
          variants={fadeVariants}
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
