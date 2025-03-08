import React, { memo, useCallback, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import DotAnimation from "@/shared/ui/dot-animation";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import "./index.scss";
import MiddleHeaderActions from "./MiddleHeaderActions";
import PinnedMessageButton from "../../common/PinnedMessageButton";
import { CalendarMonthRounded, CloseRounded } from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";
import { motion, AnimatePresence } from "framer-motion";
import { useStableCallback } from "@/shared/hooks/base";
import Modal from "@/shared/ui/Modal";
import { createSelectorHooks } from "@/lib/hooks/selectors/createSelectorHooks";
import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";
import MiddleHeaderSearch from "./MiddleHeaderSearch";
import useChatStore from "@/pages/chat/store/useChatSelector";
import buildClassName from "@/shared/lib/buildClassName";
import { DatePicker } from "@/entities/date-picker";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";

const TRANSITION_DURATION = 0.125;

const variants = {
  search: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  main: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
};

const useStore = createSelectorHooks(useChatStore);

const MiddleHeader: React.FC<{ sender?: any }> = ({ sender }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { isTablet } = useAppLayout();
  const [openDateModal, setOpenDateModal] = useState(false);

  const isChatSearching = useStore.isChatSearching();
  const toggleChatSearching = useStore.toggleChatSearching();
  const openProfileColumn = useStore.openProfileColumn();
  const toggleChatList = useStore.toggleChatList();

  // Handle ESC key press
  useComponentDidMount(() => {
    const keyboardCleanup = captureKeyboardListeners({
      bindings: { onEsc: () => isChatSearching && toggleChatSearching() },
    });
    return keyboardCleanup;
  });

  const handleDateModalOpen = useStableCallback(() => setOpenDateModal(true));
  const handleDateModalClose = useStableCallback(() => setOpenDateModal(false));

  const renderSearch = useCallback(
    () => (
      <>
        <MiddleHeaderSearch />
        <IconButton onClick={handleDateModalOpen}>
          <CalendarMonthRounded />
        </IconButton>
        <IconButton onClick={toggleChatSearching}>
          <CloseRounded />
        </IconButton>
      </>
    ),
    [handleDateModalOpen, toggleChatSearching],
  );

  const renderMain = useCallback(
    () => (
      <>
        <div className="UserDetails" onClick={openProfileColumn}>
          <p>Andrii CLiyensa</p>
        </div>
        <div className="MiddleHeaderActions">
          {!isTablet && (
            <PinnedMessageButton
              activeIndex={0}
              className="InAction"
              segmentCount={4}
            />
          )}
          <MiddleHeaderActions />
        </div>
      </>
    ),
    [isTablet, openProfileColumn],
  );

  return (
    <>
      <div ref={headerRef} className="MiddleHeaderWrapper">
        <IconButton className="BackButton" onClick={toggleChatList}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Avatar
          className="UserAvatar"
          sizes="medium"
          src="https://i.pravatar.cc/300"
        />

        <div className={"HeaderBodyWrapper"}>
          <AnimatePresence>
            <motion.div
              key={isChatSearching ? "search" : "main"}
              initial={
                isChatSearching
                  ? variants.search.initial
                  : variants.main.initial
              }
              animate={
                isChatSearching
                  ? variants.search.animate
                  : variants.main.animate
              }
              exit={isChatSearching ? variants.search.exit : variants.main.exit}
              transition={{ duration: TRANSITION_DURATION }}
              className="HeaderTransition"
            >
              {isChatSearching ? renderSearch() : renderMain()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {isTablet && (
        <PinnedMessageButton
          activeIndex={0}
          className={buildClassName(
            "UnderHeader",
            isChatSearching && "UnderHeader__Hidden",
          )}
          segmentCount={4}
        />
      )}

      <Modal isOpen={openDateModal} onClose={handleDateModalClose}>
        <DatePicker />
      </Modal>
    </>
  );
};

export default memo(MiddleHeader);
