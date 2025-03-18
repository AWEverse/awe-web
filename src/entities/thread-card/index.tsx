import React from "react";
import Linkify from "@/shared/ui/Linkify";
import { ROUTES } from "@/shared/config/routes/constants";
import "./index.scss";

interface ThreadCardProps {
  userAvatarSrc: string;
  userAvatarAlt?: string;
  userName: string;
  userTitle: string;
  userSubtitle?: React.ReactNode;
  userAvatars?: { src: string; alt: string }[];
  metaText?: string;
  moreDecorator?: React.ReactNode;
  actionDecorator?: React.ReactNode;
  positionInFeed?: number; // Added for aria-posinset
  totalFeedSize?: number; // Added for aria-setsize
  isBusy?: boolean; // Added for aria-busy
}

const ThreadCard = ({
  userAvatarSrc,
  userAvatarAlt = "User avatar",
  userName,
  userTitle,
  userSubtitle,
  metaText,
  positionInFeed,
  totalFeedSize = -1, // Default to -1 if total size is unknown
  isBusy = false,
}: ThreadCardProps) => {
  const titleId = `${userName}-thread-title-${positionInFeed || "unknown"}`;
  const subtitleId = `${userName}-thread-subtitle-${positionInFeed || "unknown"}`;

  return (
    <article
      role="article"
      draggable={false}
      aria-labelledby={titleId}
      aria-describedby={userSubtitle ? subtitleId : undefined}
      aria-posinset={positionInFeed}
      aria-setsize={totalFeedSize}
      aria-busy={isBusy}
      title={`${userName}'s thread`}
      className="thread-card"
    >
      <div className="thread-card__content">
        <header className="thread-card__header">
          <div className="thread-card__header-list">
            <img
              className="thread-card__avatar"
              alt={userAvatarAlt}
              src={userAvatarSrc}
              loading="lazy" // Improve performance for SEO
            />
            <a
              className="thread-card__username"
              href={`/profile/${encodeURIComponent(userName)}`} // Dynamic link for SEO
              title={`Visit ${userName}'s profile`}
            >
              {userName}
            </a>
            <span>@{userName}</span>
          </div>

          <div className="thread-card__title-container">
            <h3 id={titleId} className="thread-card__post-title">
              {userTitle}
            </h3>
          </div>
        </header>
        <section className="thread-card__body">
          {userSubtitle && (
            <a
              id={subtitleId}
              className="thread-card__subtitle thread-card__link"
              draggable={false}
              href={ROUTES.DIALOGS.BASE}
              title={`Thread by ${userName} about ${userTitle}`}
            >
              {userSubtitle}
            </a>
          )}
          {metaText && (
            <div className="thread-card__meta">
              <Linkify markdown={metaText} />
            </div>
          )}
        </section>
      </div>
    </article>
  );
};

export default ThreadCard;
