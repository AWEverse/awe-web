import { FC, memo } from "react";
import { Avatar } from "@mui/material";
import {
  BookmarkAddRounded,
  CommentRounded,
  FavoriteBorderRounded,
  SendRounded,
} from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";

import s from "./MediaPost.module.scss";
import buildClassName from "@/shared/lib/buildClassName";

interface MediaActionProps {
  icon: React.ReactNode;
  ariaLabel: string;
}

const MediaAction: FC<MediaActionProps> = ({ icon, ariaLabel }) => (
  <div className={s.MediaAction}>
    <IconButton aria-label={ariaLabel}>{icon}</IconButton>
  </div>
);

export interface MediaActionConfig {
  icon: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}

export interface MediaPostProps {
  id: string;
  username: string;
  subtitle: string;
  timestamp: string;
  imageSrc?: string;
  avatarSrc?: string;
  position: number;
  total: number;
  actions?: MediaActionConfig[];
  children?: React.ReactNode;
  className?: string;
}

const defaultActions: MediaActionConfig[] = [
  { icon: <FavoriteBorderRounded />, ariaLabel: "Like" },
  { icon: <CommentRounded />, ariaLabel: "Comment" },
  { icon: <SendRounded />, ariaLabel: "Share" },
  { icon: <BookmarkAddRounded />, ariaLabel: "Bookmark" },
];

const MediaPost: FC<MediaPostProps> = memo(
  ({
    id,
    username,
    subtitle,
    timestamp,
    imageSrc = "https://i.pinimg.com/736x/48/be/a2/48bea2e9863dcf86cb8a4f955ca1ec11.jpg",
    avatarSrc = "https://mui.com/static/images/avatar/1.jpg",
    position,
    total,
    actions = defaultActions,
    children,
    className,
  }) => {
    return (
      <article
        className={buildClassName(s.MediaPost, className)}
        role="article"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-subtitle`}
        aria-posinset={position}
        aria-setsize={total}
      >
        <Avatar
          alt={`${username}'s avatar`}
          className={buildClassName("awe-avatar", s.MediaAvatar)}
          src={avatarSrc}
        />
        <section className={buildClassName("awe-user", s.MediaPostHeader)}>
          <p id={`${id}-title`} className="awe-title">
            {username}
          </p>
          <p id={`${id}-subtitle`} className={buildClassName("awe-subtitle")}>
            <span>
              {subtitle} • <span>{timestamp}</span>
            </span>
          </p>
        </section>
        <section className={s.MediaPostBody}>
          <img alt="Post image" className={s.MediaImage} src={imageSrc} />
          <div className={s.MediaActions}>
            {actions.map((action, index) => (
              <MediaAction
                key={index}
                icon={action.icon}
                ariaLabel={action.ariaLabel}
                {...(action.onClick ? { onClick: action.onClick } : {})}
              />
            ))}
          </div>
          {children}
        </section>
      </article>
    );
  },
);

export default MediaPost;
