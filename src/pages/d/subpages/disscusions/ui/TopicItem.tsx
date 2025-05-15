import buildClassName from "@/shared/lib/buildClassName";
import s from "./TopicItem.module.scss";
import { WithDecorators } from "@/types/props";
import { FC, memo } from "react";
import { TagListItem } from "@/entities/tag-parts";
import { Tags } from "@/pages/d/model";
import Linkify from "@/shared/ui/Linkify";
import { Avatar } from "@mui/material";
import formatLargeNumber from "@/lib/utils/helpers/number/formatLargeNumber";
import CheckmarkCircle02Icon from "@/shared/common/icons/CheckmarkCircle02";
import Message01Icon from "@/shared/common/icons/Message01Icon";
import Task01Icon from "@/shared/common/icons/Task01";
import IconExpand from "@/shared/ui/IconExpand";

interface TopicItemProps extends WithDecorators {
  name: string;
  desc?: string;
  tags?: Tags[];
  postCount?: number;
  className?: string;
  listClassName?: string;
  onClick?: () => void;
  avatarSrc?: string;
  dateText?: string;
  publisherName?: string;
}

const TopicItem: FC<TopicItemProps> = memo(
  ({
    name,
    desc,
    tags = [],
    startDecorator,
    className,
    listClassName,
    onClick,
    avatarSrc = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    dateText = "2 days ago",
    publisherName = "Andrii Volynets",
  }) => {
    const classNames = buildClassName(className, s.topicItem);
    const listClassNames = buildClassName(listClassName, s.topicList);

    return (
      <article
        className={classNames}
        onClick={onClick}
        aria-label={`Topic: ${name}`}
      >
        <div className={s.topicContent}>
          {startDecorator}
          <div className={s.topicInfo}>
            <h3 className={s.topicTitle}>{name}</h3>
            {desc && <p className={s.topicDesc}>{desc}</p>}
            {tags.length > 0 && (
              <ul className={listClassNames} role="list">
                {tags.map(({ name }, idx) => (
                  <TagListItem key={`${name}-${idx}`}>
                    <span className={s.circle} aria-hidden="true" />
                    {name}
                  </TagListItem>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className={s.publisherWrapper}>
          <div className={s.topicList}>
            {defaultState.map(({ icon, label, count }) => (
              <IconExpand
                key={label}
                icon={icon}
                label={formatLargeNumber(count)}
              />
            ))}
          </div>
          <div className={s.publisher}>
            <Avatar
              sizes="small"
              alt="Avatar"
              className={buildClassName(s.avatar, "awe-avatar")}
              src={avatarSrc}
            />
            <div className={s.info}>
              <p className={s.publisherName}>{publisherName}</p>
              <span className={s.date}>
                <Linkify markdown={dateText} />
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  },
);

const defaultState = [
  {
    icon: <CheckmarkCircle02Icon size={20} title="Answers" />,
    label: "Replies",
    count: 2,
  },
  {
    icon: <Message01Icon size={20} title="Posts" />,
    label: "Posts",
    count: 49322,
  },
  {
    icon: <Task01Icon size={20} title="Topics" />,
    label: "Topics",
    count: 2423,
  },
];
export default TopicItem;
