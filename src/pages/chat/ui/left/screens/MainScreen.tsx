import { FC, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import s from "./MainScreen.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import LeftMainHeader from "./main/LeftMainHeader";
import ChatList from "./main/ChatList";
import SearchList from "./search/SearchList";
import LeftHeaderDropdownMenu from "./main/LeftHeaderDropdownMenu";
import { CloseRounded, EditRounded } from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";
import FloatingActionButton, {
  IFloatingAction,
} from "@/entities/FloatingActionButton";
import useFloatingButton from "../../hooks/useFloatingButton";
import { useStableCallback } from "@/shared/hooks/base";

interface OwnProps {
  className?: string;
}

type ScreenType = "search" | "chat";

const screens = {
  search: SearchList,
  chat: ChatList,
};

// Вынесем варианты анимации для упрощения кода
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const MainScreen: FC<OwnProps> = ({ className }) => {
  const [content, setContent] = useState<ScreenType>("chat");
  const { isButtonVisible, handleMouseEnter, handleMouseLeave } =
    useFloatingButton(false);

  // Используем useCallback для оптимизации переключения состояний
  const switchToChat = useCallback(() => setContent("chat"), []);
  const switchToSearch = useStableCallback(() => setContent("search"));

  // Мемоизированное условное рендеринг кнопки "назад"
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

  const actions: IFloatingAction[] = useMemo(
    () => [
      {
        icon: <>•</>,
        label: "Edit",
        onClick: () => alert("Edit action clicked!"),
      },
      {
        icon: <>•</>,
        label: "Delete",
        onClick: () => alert("Delete action clicked!"),
      },
    ],
    [],
  );

  return (
    <div
      className={s.LeftMainBody}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

      <FloatingActionButton
        actions={actions}
        className={buildClassName(
          s.ChatListFab,
          isButtonVisible && s.FabVisible,
        )}
        icon={<EditRounded />}
        isButtonVisible={isButtonVisible}
        position="bottom-right"
        size="large"
        transformOrigin={10}
      />
    </div>
  );
};

export default MainScreen;
