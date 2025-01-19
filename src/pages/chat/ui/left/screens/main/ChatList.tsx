import { FC, forwardRef, Fragment, memo, useState } from "react";
import ChatListItem from "./ChatListItem";
import { ChatAnimationTypes } from "./hooks/useChatAnimationType";
import s from "./ChatList.module.scss";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";
import TabList from "@/shared/ui/TabList";
import buildClassName from "@/shared/lib/buildClassName";

interface OwnProps {
  ref?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const tabsData = [
  { id: 1, title: "All", badgeCount: 2, isBlocked: false, isBadgeActive: true },
  {
    id: 2,
    title: "Friends",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 3,
    title: "Groups",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 4,
    title: "Archived",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 5,
    title: "Starred",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 6,
    title: "Muted",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
];

const ChatList: FC<OwnProps> = ({ ref, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTabChange = useLastCallback((index: number) => {
    setCurrentIndex(index);
  });

  return (
    <section ref={ref} className={className}>
      <TabList
        activeTab={currentIndex}
        className={s.TabListBorders}
        tabs={tabsData}
        variant="pannels"
        onSwitchTab={handleTabChange}
      />

      <div data-scrolled={true} className={buildClassName(s.ChatList)}>
        {Array.from({ length: 20 }, (_, i) => (
          <Fragment key={i}>
            <ChatListItem
              animation={ChatAnimationTypes.Move}
              chatId={`${i}`}
              currentUserId="1"
              orderDiff={i}
            />
            <hr className={s.ChatListDivider} />
          </Fragment>
        ))}
      </div>
    </section>
  );
};

export default memo(ChatList);
