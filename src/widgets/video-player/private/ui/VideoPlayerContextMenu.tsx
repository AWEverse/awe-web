import ContextMenu from "@/entities/context-menu";
import { ContextMenuProps } from "@/entities/context-menu/public/ContextMenu";
import { useStableCallback } from "@/shared/hooks/base";
import ActionButton from "@/shared/ui/ActionButton";
import MenuSeparator from "@/shared/ui/MenuSeparator";
import {
  RepeatOutlined,
  LoopRounded,
  ControlPointDuplicateSharp,
  LibraryAddRounded,
  ArrowRightRounded,
  ArrowLeftRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "motion/react";
import { FC, useState, memo } from "react";

interface VideoPlayerContextMenuProps
  extends Omit<ContextMenuProps, "children"> {}

const VideoPlayerContextMenu: FC<VideoPlayerContextMenuProps> = (props) => {
  const [showSavingActions, setShowSavingActions] = useState(false);

  const openSavingActions = useStableCallback(() => {
    setShowSavingActions(true);
  });

  const goBack = useStableCallback(() => {
    setShowSavingActions(false);
  });

  return (
    <ContextMenu {...props} animations={{ layout: "size" }}>
      <AnimatePresence initial={false} mode="popLayout">
        {showSavingActions ? (
          <motion.div
            key="savingActions"
            style={{ width: "100%" }}
            initial={{ x: "100%" }}
            animate={{ x: "0" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.125 }}
          >
            <ActionButton
              size="sm"
              variant="contained"
              fullWidth
              onClick={goBack}
            >
              <ArrowLeftRounded />
              <span>Go back</span>
            </ActionButton>
            <MenuSeparator size="thick" />
            <ActionButton
              size="sm"
              variant="contained"
              fullWidth
              onClick={goBack}
            >
              <ArrowLeftRounded />
              <span>Save video frame as...</span>
            </ActionButton>
            <ActionButton
              size="sm"
              variant="contained"
              fullWidth
              onClick={goBack}
            >
              <ArrowLeftRounded />
              <span>Save video as...</span>
            </ActionButton>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            style={{ width: "100%" }}
            initial={{ x: "-100%" }}
            animate={{ x: "0" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.125 }}
          >
            <ActionButton size="sm" variant="contained" fullWidth>
              <RepeatOutlined />
              <span>Repeat</span>
            </ActionButton>
            <ActionButton size="sm" variant="contained" fullWidth>
              <LoopRounded />
              <span>Loop</span>
            </ActionButton>
            <ActionButton size="sm" variant="contained" fullWidth>
              <ControlPointDuplicateSharp />
              <span>Show controls</span>
            </ActionButton>
            <MenuSeparator size="thick" />
            <ActionButton
              size="sm"
              variant="contained"
              fullWidth
              onClick={openSavingActions}
            >
              <LibraryAddRounded />
              <span>Saving actions</span>
              <ArrowRightRounded />
            </ActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ContextMenu>
  );
};

export default memo(VideoPlayerContextMenu);
