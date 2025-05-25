import s from "./LeftChatListItem.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import { Avatar } from "@mui/material";
import {
  ApiChat,
  ApiPeer,
  ApiTopic,
  ApiTypingStatus,
} from "@/@types/api/types/chats";

import { ApiUser, ApiUserStatus } from "@/@types/api/types/user";

import { memo } from "react";
import RippleEffect from "@/shared/ui/ripple-effect";
import { CollectionsBookmarkRounded } from "@mui/icons-material";
import { ApiChatFolderItem, ApiChatType } from "@/shared/api";

type OwnProps = {
  className?: string;
  onClick?: () => void;
  onDragEnter?: (chatId: string) => void;
};

type StateProps = Partial<ApiChatFolderItem>;

const LeftChatListItem: React.FC<OwnProps & StateProps> = ({
  id,
  chatId,
  folderId,
  position,
  addedAt,
  chat,
}) => {
  const {
    id: peerId = "1",
    type = ApiChatType.PRIVATE,
    title = "Chat Title",
    description = "Chat Description",
    avatarUrl = "https://picsum.photos/200",
    flags = 0,
    memberCount = 2,
    lastMessageAt = new Date(),
    lastMessageText = "Last message text",
    createdAt = new Date(),
    createdBy,
  } = chat!;

  const classNames = buildClassName(
    "awe-user",
    "awe-user-actions",
    s.LeftChatListItem,
  );

  return (
    <a
      className={classNames}
      draggable={false}
      href={`#`}
      role="button"
      tabIndex={0}
      onClick={() => {}}
      title={
        description ||
        title +
          " Chat was created by " +
          createdBy?.username +
          " at " +
          createdAt.toLocaleString()
      }
    >
      <Avatar className={s.Avatar} src={"https://picsum.photos/200"} />
      <section className={"awe-title"}>
        <h3 className={"awe-overflow-ellipsis"}>{title}</h3>
        <span className={s.TopActions}>
          {lastMessageAt ? formatTgDate(lastMessageAt) : ""}
        </span>
      </section>
      <section className={"awe-subtitle"}>
        <p className={"awe-overflow-ellipsis"}>
          {lastMessageText || "There are no messages yet."}

          {type !== ApiChatType.PRIVATE && memberCount !== undefined && (
            <span className={s.MemberCount}>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          )}
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

function formatTgDate(lastMessageAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - lastMessageAt.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
}
