import React, { memo, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import "./index.scss";
import PinnedMessageButton from "../../common/PinnedMessageButton";
import IconButton from "@/shared/ui/IconButton";
import { useStableCallback } from "@/shared/hooks/base";
import Modal from "@/shared/ui/Modal";
import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";
import buildClassName from "@/shared/lib/buildClassName";
import { DatePicker } from "@/entities/date-picker";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import { createSelectorHooks } from "@/lib/hooks/selectors/createSelectorHooks";
import useChatStore from "@/pages/chat/store/useChatSelector";
import { HeaderContent } from "./MiddleHeaderContent";

const useStore = createSelectorHooks(useChatStore);

const MiddleHeader: React.FC<{ sender?: any }> = ({ sender }) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const lessTablet = useAppLayout((state) => state.isTablet || state.isMobile);

  const [openDateModal, setOpenDateModal] = useState(false);

  const isMiddleSearchOpen = useStore.isChatSearching();
  const toggleMiddleSearch = useStore.toggleChatSearching();
  const toggleChatList = useStore.toggleChatList();

  useComponentDidMount(() => {
    const keyboardCleanup = captureKeyboardListeners({
      bindings: { onEsc: () => isMiddleSearchOpen && toggleMiddleSearch() },
    });
    return keyboardCleanup;
  });

  const handleDateModalOpen = useStableCallback(() => setOpenDateModal(true));
  const handleDateModalClose = useStableCallback(() => setOpenDateModal(false));

  return (
    <>
      <div ref={headerRef} className="MiddleHeaderWrapper">
        <IconButton className="BackButton" onClick={toggleChatList}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <Avatar
          className="UserAvatar"
          sizes="medium"
          src={sender?.avatar || "https://i.pravatar.cc/300"}
        />

        <HeaderContent
          senderName={sender?.name || "Andrii CLiyensa"}
          isSearchOpen={isMiddleSearchOpen}
          onDateModalOpen={handleDateModalOpen}
        />
      </div>

      {lessTablet && (
        <PinnedMessageButton
          activeIndex={0}
          className={buildClassName(
            "UnderHeader",
            isMiddleSearchOpen && "UnderHeader__Hidden",
          )}
          segmentCount={10}
        />
      )}

      <Modal isOpen={openDateModal} onClose={handleDateModalClose}>
        <DatePicker />
      </Modal>
    </>
  );
};

export default memo(MiddleHeader);
