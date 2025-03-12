import { FC, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EditScreen from "./drawer-screens/EditScreen";
import MainScreen from "./drawer-screens/MainScreen";
import "./RightColumn.scss";
import useChatState from "../../store/state/useChatState";

const TRANSITION_DURATION = 0.3; // seconds

const RightColumn: FC = () => {
  const { isRightPanelOpen, isRightPanelEditing } = useChatState();

  return (
    <section className="RightColumnWrapper" data-shown={isRightPanelOpen}>
      <AnimatePresence initial={false} mode="popLayout">
        {isRightPanelOpen && (
          <motion.div
            className={"RightColumn"}
            key={isRightPanelEditing ? "edit" : "main"}
            initial={{ x: "0" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: TRANSITION_DURATION,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {isRightPanelEditing ? <EditScreen /> : <MainScreen />}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default memo(RightColumn);
