import { FC, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EditScreen from "./EditScreen";
import MainScreen from "./MainScreen";
import "./RightColumn.scss";
import useChatStore from "../../store/useChatSelector";
import { SLIDE_RIGHT, SLIDE_LEFT } from "@/shared/animations/slideInVariant";

const TRANSITION_DURATION = 0.3; // seconds
const PANEL_WIDTH = 420; // Assuming 420px is the panel width

const RightColumn: FC = () => {
  const isRightPanelOpen = useChatStore((s) => s.isProfileColumn);
  const isRightPanelEditing = useChatStore((s) => s.isProfileEditing);

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
              key={isRightPanelEditing ? "edit" : "main"}
              className={"RightColumn"}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={isRightPanelEditing ? SLIDE_RIGHT : SLIDE_LEFT}
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
