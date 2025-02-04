import React, { FC } from "react";
import { Avatar, Typography } from "@mui/material";
import { VerticalDivider } from "@/shared/ui/Divider";
import Linkify from "@/shared/ui/Linkify";
import s from "./index.module.scss";
import { ROUTES } from "@/shared/config/routes/constants";

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
}

const ThreadCard: FC<ThreadCardProps> = ({
  userAvatarSrc,
  userAvatarAlt = "User avatar",
  userName,
  userTitle,
  userSubtitle,
  userAvatars = [],
  metaText,
  moreDecorator,
  actionDecorator,
}) => {
  return (
    <article aria-label={`Thread card by ${userName}`} className={s.threadCard}>
      <a
        className={s.link}
        draggable={false}
        href={ROUTES.DIALOGS.BASE}
        title={`Go to ${userName}'s thread`}
      ></a>
      <div className={s.content}>
        <VerticalDivider className={s.avatar} separatorposition={0}>
          <Avatar alt={userAvatarAlt} src={userAvatarSrc} />

          {userAvatars.length > 0 && (
            <div aria-label="Other avatars" className={s.avatars}>
              {userAvatars.map(({ src, alt }, index) => (
                <Avatar
                  key={index}
                  alt={alt}
                  className={s.partition}
                  src={src}
                  sx={{ width: "24px", height: "24px" }}
                />
              ))}
            </div>
          )}
        </VerticalDivider>

        <div className={s.text}>
          <header className={s.header}>
            <Typography className={s.username} component="h2" fontWeight="bold">
              {userName}
            </Typography>

            <div className={s.titleContainer}>
              <Typography className={s.title} component="h3">
                {userTitle}
              </Typography>

              {moreDecorator && (
                <div className={s.moreDecorator}>{moreDecorator}</div>
              )}
            </div>
          </header>

          <section className={s.body}>
            {userSubtitle && (
              <Typography component="p">{userSubtitle}</Typography>
            )}

            {actionDecorator && (
              <div className={s.actionDecorator}>{actionDecorator}</div>
            )}

            {metaText && <Linkify markdown={metaText} />}
          </section>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
