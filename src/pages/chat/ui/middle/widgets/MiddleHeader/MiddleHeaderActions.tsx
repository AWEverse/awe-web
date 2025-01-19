import { FC, memo, useState } from "react";
import s from "./MiddleHeaderActions.module.scss";
import {
  CallOutlined,
  SearchOutlined,
  NotificationsOutlined,
  ChecklistRtlOutlined,
} from "@mui/icons-material";
import buildClassName from "@/shared/lib/buildClassName";
import { withStateProps } from "@/lib/core";
import MiddleHeaderDropdown from "./MiddleHeaderDropdown";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";
import IconButton from "@/shared/ui/IconButton";
import useChatStore from "@/pages/chat/store/useChatSelector";
import CallModal from "../../call/CallModal";

interface OwnProps {
  chatId?: string;
  className?: string;
}

interface StateProps {
  // General options
  noMenu?: boolean;
  noAnimation?: boolean;
  isChannel?: boolean;
  isRightColumnShown?: boolean;

  // Bot-related options
  canStartBot?: boolean;
  canRestartBot?: boolean;

  // User actions
  canUnblock?: boolean;
  canSubscribe?: boolean;
  canSearch?: boolean;
  canCall?: boolean;
  canMute?: boolean;
  canLeave?: boolean;
  canEnterVoiceChat?: boolean;
  canCreateVoiceChat?: boolean;

  // Translation-related options
  canTranslate?: boolean;
  isTranslating?: boolean;
  translationLanguage?: string;
  language?: string;
  detectedChatLanguage?: string;
  doNotTranslate?: string[];

  // Join request options
  pendingJoinRequests?: number;
  shouldJoinToSend?: boolean;
  shouldSendJoinRequest?: boolean;
}

/*
TODO: Shall we need to add a pop-up tooltip 
that informs the potential user about the action they have archived now 
*/
const MiddleHeaderActions: FC<OwnProps & StateProps> = (props) => {
  const { className, noMenu } = props;
  const [openCallModal, setOpenCallModal] = useState(false);

  const toggleChatSearching = useChatStore(
    (state) => state.toggleChatSearching,
  );

  const handleOpenCallModal = useLastCallback(() => {
    setOpenCallModal(true);
  });

  const handleCloseCallModal = useLastCallback(() => {
    setOpenCallModal(false);
  });

  return noMenu ? null : (
    <>
      <div className={buildClassName(s.MiddleHeaderActions, className)}>
        <IconButton>
          <ChecklistRtlOutlined />
        </IconButton>
        <IconButton active={openCallModal} onClick={handleOpenCallModal}>
          <CallOutlined />
        </IconButton>
        <IconButton className="Search_Visible" onClick={toggleChatSearching}>
          <SearchOutlined />
        </IconButton>
        <IconButton>
          <NotificationsOutlined />
        </IconButton>
        <MiddleHeaderDropdown />
      </div>
      <CallModal isOpen={openCallModal} onClose={handleCloseCallModal} />
    </>
  );
};

export default memo(
  withStateProps((): StateProps => {
    const noMenu = false;

    return {
      noMenu,
      noAnimation: false,
      isChannel: false,
      isRightColumnShown: false,
      canStartBot: false,
      canRestartBot: false,
      canUnblock: false,
      canSubscribe: false,
      canSearch: false,
      canCall: false,
      canMute: false,
      canLeave: false,
      canEnterVoiceChat: false,
      canCreateVoiceChat: false,
      canTranslate: false,
      isTranslating: false,
      translationLanguage: "en",
      language: "en",
      detectedChatLanguage: "",
      doNotTranslate: [],
      pendingJoinRequests: 0,
      shouldJoinToSend: false,
      shouldSendJoinRequest: false,
    };
  })(MiddleHeaderActions),
);
