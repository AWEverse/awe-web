import { useStableCallback } from "@/shared/hooks/base";
import TabList from "@/shared/ui/TabList";
import { Box, Link, Stack } from "@mui/material";
import { memo, useState } from "react";
import { Outlet } from "react-router";

import "./index.scss";

type RangedInteger = {};

const RedditPage = () => {
  const [activeTabIndex, setTabIndex] = useState(0);

  const handleTabChange = useStableCallback((index: number) => {
    setTabIndex(index);
  });

  return (
    <>
      <TabList
        className="community__navigation"
        activeTab={activeTabIndex}
        tabs={[
          { id: 0, title: "Home", href: "/d/home" },
          { id: 1, title: "Chat", href: "/chat" },
          { id: 2, title: "Overview", href: "/d/overview" },
          { id: 3, title: "Topic's", href: "/d/disscusions" },
          { id: 4, title: "Team's" },
          { id: 5, title: "People's", href: "/d/members" },
          { id: 6, title: "Settings" },
        ]}
        onSwitchTab={handleTabChange}
      />

      <Outlet />
    </>
  );
};

export default memo(RedditPage);
