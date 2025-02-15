import React, {
  createRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Avatar } from "@mui/material";
import { UserProps } from "@/shared/types";
import DotAnimation from "@/shared/ui/dot-animation";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import "./index.scss";
import MiddleHeaderActions from "./MiddleHeaderActions";
import PinnedMessageButton from "../../common/PinnedMessageButton";
import useMedia from "@/lib/hooks/ui/useMedia";
import { CalendarMonthRounded, CloseRounded } from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useStableCallback } from "@/shared/hooks/base";
import Modal from "@/shared/ui/Modal";
import { createSelectorHooks } from "@/lib/hooks/selectors/createSelectorHooks";
import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";
import MiddleHeaderSearch from "./MiddleHeaderSearch";
import useChatStore from "@/pages/chat/store/useChatSelector";
import useConditionalRef from "@/lib/hooks/utilities/useConditionalRef";
import buildClassName from "@/shared/lib/buildClassName";
import { DatePicker } from "@/entities/date-picker";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";

const TRANSITION_DURATION = 300;

const useStore = createSelectorHooks(useChatStore);

const MiddleHeader: React.FC<{ sender?: UserProps }> = ({ sender }) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const isTablet = useMedia("(max-width: 1024px)");

  const [openDateModal, setOpenDateModal] = useState(false);

  const isChatSearching = useStore.isChatSearching();
  const toggleChatSearching = useStore.toggleChatSearching();

  const openProfileColumn = useStore.openProfileColumn();
  const toggleChatList = useStore.toggleChatList();

  const onTransitionStart = useStableCallback(() => {
    if (headerRef.current) {
      headerRef.current.style.overflow = "hidden";
    }
  });

  const onTransitionEnd = useStableCallback(() => {
    if (headerRef.current) {
      headerRef.current.style.overflow = "visible";
    }
  });

  const handleEscListener = useStableCallback(() => {
    if (isChatSearching) {
      toggleChatSearching();
    }
  });

  useComponentDidMount(() => {
    const keyboardListenersCleanup = captureKeyboardListeners({
      onEsc: handleEscListener,
    });

    return () => {
      keyboardListenersCleanup();
    };
  });

  const handleDateModalOpen = useStableCallback(() => {
    setOpenDateModal(true);
  });

  const handleDateModalClose = useStableCallback(() => {
    setOpenDateModal(false);
  });

  const renderSearch = useCallback(() => {
    return (
      <>
        <MiddleHeaderSearch />
        <IconButton onClick={handleDateModalOpen}>
          <CalendarMonthRounded />
        </IconButton>
        <IconButton onClick={toggleChatSearching}>
          <CloseRounded />
        </IconButton>
      </>
    );
  }, []);

  const renderMain = useCallback(() => {
    return (
      <>
        <div className={"UserDetails"} onClick={openProfileColumn}>
          <p>Andrii CLiyensa</p>
          <DotAnimation content="Looking" />
        </div>
        <div className={"MiddleHeaderActions"}>
          {!isTablet && (
            <PinnedMessageButton
              activeIndex={0}
              className={"InAction"}
              segmentCount={4}
            />
          )}
          <MiddleHeaderActions />
        </div>
      </>
    );
  }, [isTablet]);

  const nodeRef = useConditionalRef<HTMLDivElement>(null, [isChatSearching]);

  return (
    <>
      <div ref={headerRef} className={"MiddleHeaderWrapper"}>
        <IconButton className={"BackButton"} onClick={toggleChatList}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <Avatar
          className={"UserAvatar"}
          sizes="medium"
          src={"https://i.pravatar.cc/300"}
        />

        <TransitionGroup className={"HeaderBodyWrapper"}>
          <CSSTransition
            key={isChatSearching ? "search" : "main"}
            classNames={isChatSearching ? "toTop" : "toBottom"}
            nodeRef={nodeRef}
            timeout={TRANSITION_DURATION}
            onEnter={onTransitionStart}
            onExited={onTransitionEnd}
          >
            <div ref={nodeRef} className={"HeaderTransition"}>
              {isChatSearching ? renderSearch() : renderMain()}
            </div>
          </CSSTransition>
        </TransitionGroup>
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
