import { forwardRef, useMemo, useState } from "react";
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
import useConditionalRef from "@/lib/hooks/utilities/useConditionalRef";
import useChatStore from "@/pages/chat/store/useChatSelector";
import { useStableCallback } from "@/shared/hooks/base";

interface OwnProps {
  className?: string;
}

type ScreenType = "search" | "chat";

const screens = {
  search: SearchList,
  chat: ChatList,
};

const MainScreen = forwardRef<HTMLDivElement, OwnProps>(
  ({ className }, ref) => {
    const toggleFooter = useChatStore((state) => state.toggleFooter);

    const [content, setContent] = useState<ScreenType>("chat");
    const { isButtonVisible, handleMouseEnter, handleMouseLeave } =
      useFloatingButton(false);

    const currentRef = useConditionalRef<HTMLDivElement>(null, [content]);

    const renderBackButton = useMemo(
      () =>
        content === "search" ? (
          <IconButton size="medium" onClick={() => setContent("chat")}>
            <CloseRounded />
          </IconButton>
        ) : (
          <LeftHeaderDropdownMenu />
        ),
      [content],
    );

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
        "-",
        { icon: <>•</>, label: "Tool panel", onClick: toggleFooter },
      ],
      [],
    );

    const handleSwitchSearch = useStableCallback(() => {
      setContent("search");
    });

    return (
      <div
        ref={ref}
        className={buildClassName(className, s.MainScreen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <section className={s.LeftMainHeader}>
          {renderBackButton}
          <LeftMainHeader onFocus={handleSwitchSearch} />
        </section>

        <section className={s.LeftMainBody}>
          <AnimatePresence>
            <motion.div
              key={content}
              ref={currentRef}
              className={s.LeftMainContent}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CurrentScreen ref={currentRef} />
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
        </section>
      </div>
    );
  },
);

export default MainScreen;
