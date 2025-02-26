import { FC, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DrawerColumn from "./DrawerColumn";
import EditScreen from "./drawer-screens/EditScreen";
import MainScreen from "./drawer-screens/MainScreen";
import "./RightColumn.scss";
import useChatStore from "../../store/useChatSelector";

const TRANSITION_DURATION = 0.125; // seconds

const RightColumn: FC = () => {
  const isProfileEditing = useChatStore((state) => state.isProfileEditing);
  const isProfileColumn = useChatStore((state) => state.isProfileColumn);
  const handleClose = useChatStore((state) => state.closeProfileColumn);

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {isProfileColumn && (
        <motion.div
          className={"RightColumn"}
          key={isProfileEditing ? "edit" : "main"}
          initial={{ x: isProfileEditing ? "-100%" : "100%" }}
          animate={{ x: 0 }}
          exit={{ x: isProfileEditing ? "-100%" : "100%" }}
          transition={{ duration: TRANSITION_DURATION }}
        >
          {isProfileEditing ? <EditScreen /> : <MainScreen />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(RightColumn);
