import { FC, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EditScreen from "./drawer-screens/EditScreen";
import MainScreen from "./drawer-screens/MainScreen";
import "./RightColumn.scss";
import useChatState from "../../store/state/useChatState";

const TRANSITION_DURATION = 0.3; // seconds
const PANEL_WIDTH = 420; // Assuming 420px is the panel width

const RightColumn: FC = () => {
  const { isRightPanelOpen, isRightPanelEditing } = useChatState();

  return (
    <AnimatePresence>
      {isRightPanelOpen && (
        <motion.section
          className="RightColumnWrapper"
          initial={{ x: PANEL_WIDTH }}
          animate={{ x: 0 }}
          exit={{ x: PANEL_WIDTH }}
          transition={{
            duration: TRANSITION_DURATION,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              className={"RightColumn"}
              key={isRightPanelEditing ? "edit" : "main"}
              initial={{ x: isRightPanelEditing ? PANEL_WIDTH : -PANEL_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: isRightPanelEditing ? PANEL_WIDTH : -PANEL_WIDTH }}
              transition={{
                duration: TRANSITION_DURATION,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {isRightPanelEditing ? <EditScreen /> : <MainScreen />}
            </motion.div>
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default memo(RightColumn);
