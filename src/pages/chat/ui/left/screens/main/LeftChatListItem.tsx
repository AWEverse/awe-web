import s from "./LeftChatListItem.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import { Avatar } from "@mui/material";
import {
  ApiChat,
  ApiPeer,
  ApiTopic,
  ApiTypingStatus,
} from "@/@types/api/types/chats";
import {
  ApiMessage,
  ApiMessageOutgoingStatus,
} from "@/@types/api/types/messages";
import { ApiUser, ApiUserStatus } from "@/@types/api/types/user";
import { ObserveFn } from "@/shared/hooks/DOM/useIntersectionObserver";
import { ChatAnimationTypes } from "./hooks/useChatAnimationType";
import { memo } from "react";
import RippleEffect from "@/shared/ui/ripple-effect";
import { CollectionsBookmarkRounded } from "@mui/icons-material";

type OwnProps = {
  chatId: string;
  folderId?: number;
  orderDiff: number;
  animation: ChatAnimationTypes;
  pinned?: boolean;
  offsetTop?: number;
  savedDialog?: boolean;
  preview?: boolean;
  previewMsgId?: number;
  className?: string;
  onClick?: () => void;
  observe?: ObserveFn;
  onDragEnter?: (chatId: string) => void;
};

type StateProps = {
  chat?: ApiChat;
  muted?: boolean;
  user?: ApiUser;
  status?: ApiUserStatus;
  targetUserIds?: string[];
  targetMessage?: ApiMessage;
  targetChatId?: string;
  lastSender?: ApiPeer;
  outgoingStatus?: ApiMessageOutgoingStatus;
  selected?: boolean;
  forumSelected?: boolean;
  forumOpen?: boolean;
  canScroll?: boolean;
  canChangeFolder?: boolean;
  lastTopic?: ApiTopic;
  typing?: ApiTypingStatus;
  animations?: boolean;
  lastMsgId?: number;
  lastMsg?: ApiMessage;
  currentUserId: string;
};

const LeftChatListItem: React.FC<OwnProps & StateProps> = () => {
  const classNames = buildClassName(
    "awe-user",
    "awe-user-actions",
    s.LeftChatListItem,
  );

  return (
    <a
      className={classNames}
      draggable={false}
      href="#-124434303"
      role="button"
      tabIndex={0}
      onClick={() => {}}
    >
      <Avatar className={s.Avatar} src={"https://picsum.photos/200"} />
      <section className={"awe-title"}>
        <h3 className={"awe-overflow-ellipsis"}>Albinchik</h3>
        <span className={s.TopActions}>14:33</span>
      </section>
      <section className={"awe-subtitle"}>
        <p className={"awe-overflow-ellipsis"}>
          Hi, how are you? <span className={s.Emoji}>😀</span>
        </p>
        <span className={s.BottomActions}>
          <CollectionsBookmarkRounded />
        </span>
      </section>
      <RippleEffect />
    </a>
  );
};

export default memo(LeftChatListItem);
