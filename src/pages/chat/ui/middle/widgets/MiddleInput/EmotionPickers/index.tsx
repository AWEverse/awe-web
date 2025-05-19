import { usePrevious, useStableCallback } from "@/shared/hooks/base";
import Dropdown, { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import TabList from "@/shared/ui/TabList";
import { AddReactionTwoTone } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useState } from "react";
import GifPicker from "./screens/GifPicker";
import StickerPicker from "./screens/StickerPicker";
import { SLIDE_LEFT, SLIDE_RIGHT } from "@/shared/animations/slideInVariant";
import EmojiPicker from "./screens/EmojiPicker";
import s from "./index.module.scss";

interface OwnProps {}

interface StateProps {}

const TriggerEmojiButton: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
  <IconButton
    active={isOpen}
    className="MiddleInputEmojiButton"
    onClick={onTrigger}
    size="small"
    aria-label="Insert Emoji"
  >
    <AddReactionTwoTone />
  </IconButton>
);

enum EmotionPickerTabs {
  EMOJI = 0,
  GIF = 1,
  STICKER = 2,
  CUSTOM_EMOJI = 3,
  CUSTOM_STICKER = 4,
  CUSTOM_GIF = 5,
}

const EmotionPicker: FC<OwnProps & StateProps> = () => {
  const [activeTab, setActiveTab] = useState(0);

  const previousTab = usePrevious(activeTab) || 0;

  const handleTabChange = useStableCallback((index: number) => {
    setActiveTab(index);
  });

  return (
    <Dropdown
      className={s.MiddleInputEmotionPicker}
      position="bottom-left"
      triggerButton={TriggerEmojiButton}
      leaveOnOver={false}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={activeTab}
          variants={activeTab <= previousTab ? SLIDE_LEFT : SLIDE_RIGHT}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ width: "inherit", height: "100%" }}
        >
          {activeTab === 0 && <EmojiPicker />}
          {activeTab === 1 && <StickerPicker />}
          {activeTab === 2 && <GifPicker />}
        </motion.div>
      </AnimatePresence>

      <TabList
        variant="fill"
        tabs={[
          { id: 0, title: "Emoji" },
          { id: 1, title: "Stickers" },
          { id: 2, title: "GIFs" },
        ]}
        activeTab={activeTab}
        onSwitchTab={handleTabChange}
      />
    </Dropdown>
  );
};

export default EmotionPicker;
