import React, { memo, useCallback, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import "./index.scss";
import MiddleHeaderActions from "./MiddleHeaderActions";
import PinnedMessageButton from "../../common/PinnedMessageButton";
import { CalendarMonthRounded, CloseRounded } from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";
import { motion, AnimatePresence } from "framer-motion";
import { useStableCallback } from "@/shared/hooks/base";
import Modal from "@/shared/ui/Modal";
import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";
import MiddleHeaderSearch from "./MiddleHeaderSearch";
import buildClassName from "@/shared/lib/buildClassName";
import { DatePicker } from "@/entities/date-picker";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import useChatState from "@/pages/chat/store/state/useChatState";

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

const MiddleHeader: React.FC<{ sender?: any }> = ({ sender }) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const lessTablet = useAppLayout((state) => state.isTablet || state.isMobile);

  const [openDateModal, setOpenDateModal] = useState(false);

  // const isMiddleSearchOpen = useStore.isMiddleSearchOpen();
  // const toggleMiddleSearch = useStore.toggleMiddleSearch();
  // const openProfileColumn = useStore.openProfileColumn();
  // const toggleChatList = useStore.toggleChatList();

  const {
    isMiddleSearchOpen,
    toggleMiddleSearch,
    toggleLeftPanel,
    setRightPanelOpen,
  } = useChatState();

  const openProfileColumn = () => {
    setRightPanelOpen(true);
  };

  useComponentDidMount(() => {
    const keyboardCleanup = captureKeyboardListeners({
      bindings: { onEsc: () => isMiddleSearchOpen && toggleMiddleSearch() },
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
        <IconButton onClick={toggleMiddleSearch}>
          <CloseRounded />
        </IconButton>
      </>
    ),
    [handleDateModalOpen, toggleMiddleSearch],
  );

  const renderMain = useCallback(
    () => (
      <>
        <div
          className="UserDetails allow-width-right-column-header"
          onClick={openProfileColumn}
        >
          <p>Andrii CLiyensa</p>
        </div>
        <div className="MiddleHeaderActions allow-space-right-column-header">
          {!lessTablet && (
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
    [lessTablet, openProfileColumn],
  );

  return (
    <>
      <div ref={headerRef} className="MiddleHeaderWrapper">
        <IconButton className="BackButton" onClick={toggleLeftPanel}>
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
              key={isMiddleSearchOpen ? "search" : "main"}
              initial={
                isMiddleSearchOpen
                  ? variants.search.initial
                  : variants.main.initial
              }
              animate={
                isMiddleSearchOpen
                  ? variants.search.animate
                  : variants.main.animate
              }
              exit={
                isMiddleSearchOpen ? variants.search.exit : variants.main.exit
              }
              transition={{ duration: TRANSITION_DURATION }}
              className="HeaderTransition"
            >
              {isMiddleSearchOpen ? renderSearch() : renderMain()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {lessTablet && (
        <PinnedMessageButton
          activeIndex={0}
          className={buildClassName(
            "UnderHeader",
            isMiddleSearchOpen && "UnderHeader__Hidden",
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
