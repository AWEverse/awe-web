import React, { FC, memo, useState } from "react";
import s from "./SearchList.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import TabList from "@/shared/ui/TabList";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";

interface OwnProps {
  ref?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const tabsData = [
  {
    id: 1,
    title: "Chats",
    badgeCount: 14,
    isBlocked: false,
    isBadgeActive: true,
  },
  {
    id: 2,
    title: "Media",
    badgeCount: 123,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 3,
    title: "Links",
    badgeCount: 32,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 4,
    title: "Files",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 5,
    title: "Music",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 6,
    title: "Voices",
    badgeCount: 0,
    isBlocked: false,
    isBadgeActive: false,
  },
];

const SearchList: FC<OwnProps> = ({ ref, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTabChange = useLastCallback((index: number) => {
    setCurrentIndex(index);
  });

  return (
    <section
      ref={ref}
      className={buildClassName(
        s.LeftMainSearchBody,
        className,
        "awe-scrollbar",
      )}
    >
      <TabList
        activeTab={currentIndex}
        className={s.TabListBorders}
        tabs={tabsData}
        variant="pannels"
        onSwitchTab={handleTabChange}
      />
      {/* <nav className={s.SeacrhNavBar}> Search result navigation </nav> */}

      <ul className={s.SearchList}>
        <li aria-details="Search result 1" className={`${s.SearchResult}`}>
          <h2 className={s.SeacrhResultTitle}>Search result 1</h2>
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit
            quae perferendis debitis sit? Asperiores nam aperiam, dolor unde,
            quia aliquid omnis, officia recusandae molestias fugiat praesentium
            consequatur? Minima, eveniet voluptate.
          </p>
        </li>
        <li aria-details="Search result 2" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 2</h2>
        </li>
        <li aria-details="Search result 3" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 3</h2>
        </li>
        <li aria-details="Search result 4" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 4</h2>
        </li>
        <li aria-details="Search result 5" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 5</h2>
        </li>
      </ul>
    </section>
  );
};

export default memo(SearchList);
