import { FC, Fragment, memo, useState } from "react";
import LeftChatListItem from "./LeftChatListItem";
import { ChatAnimationTypes } from "./hooks/useChatAnimationType";
import s from "./LeftChatList.module.scss";
import { usePrevious, useStableCallback } from "@/shared/hooks/base";
import TabList from "@/shared/ui/TabList";
import buildClassName from "@/shared/lib/buildClassName";
import { AnimatePresence, motion } from "framer-motion";

interface OwnProps {
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

const variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
  animate: {
    x: 0,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
  }),
};

const LeftChatList: FC<OwnProps> = ({ className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const previousIndex = usePrevious(currentIndex);

  const direction = currentIndex - (previousIndex || 0);

  const handleTabChange = useStableCallback((index: number) => {
    setCurrentIndex(index);
  });

  return (
    <>
      <TabList
        activeTab={currentIndex}
        className={s.LeftTabListBorders}
        tabs={tabsData}
        variant="pannels"
        onSwitchTab={handleTabChange}
        contextMenuOptions={[
          {
            description: "Switch to Previous Tab",
            label: "Previous",
            onClick: (value?: number) => {
              const newIndex =
                currentIndex > 0 ? currentIndex - 1 : tabsData.length - 1;
              handleTabChange(newIndex);
            },
          },
          {
            description: "Switch to Next Tab",
            label: "Next",
            onClick: (value?: number) => {
              const newIndex =
                currentIndex < tabsData.length - 1 ? currentIndex + 1 : 0;
              handleTabChange(newIndex);
            },
          },
          {
            description: "Close Tab",
            label: "Close",
            onClick: (value?: number) => {
              if (value !== undefined) {
              }
            },
          },
        ]}
      />

      <AnimatePresence custom={direction} initial={false} mode="popLayout">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i}>
            <LeftChatListItem
              animation={ChatAnimationTypes.Move}
              chatId={`${i}`}
              currentUserId="1"
              orderDiff={i}
            />
            <hr className={s.LeftChatListDivider} />
          </div>
        ))}
      </AnimatePresence>
    </>
  );
};

export default memo(LeftChatList);
