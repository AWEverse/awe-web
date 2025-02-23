import { FC, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DrawerColumn from "./DrawerColumn";
import EditScreen from "./drawer-screens/EditScreen";
import MainScreen from "./drawer-screens/MainScreen";
import "./RightColumn.scss";
import useChatStore from "../../store/useChatSelector";

const TRANSITION_DURATION = 0.125; // seconds

const RightColumn: FC = () => {
  const isOpen = useChatStore((state) => state.isProfileEditing);

  return (
    <DrawerColumn>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={isOpen ? "edit" : "main"}
          initial={{ x: isOpen ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: isOpen ? "100%" : "-100%" }}
          transition={{ duration: TRANSITION_DURATION }}
        >
          {isOpen ? <EditScreen /> : <MainScreen />}
        </motion.div>
      </AnimatePresence>
    </DrawerColumn>
  );
};

export default memo(RightColumn);
