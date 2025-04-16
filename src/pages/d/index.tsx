import { useStableCallback } from "@/shared/hooks/base";
import TabList from "@/shared/ui/TabList";
import { Box, Link, Stack } from "@mui/material";
import { memo, useState } from "react";
import { Outlet } from "react-router";

type RangedInteger = {};

const RedditPage = () => {
  const [activeTabIndex, setTabIndex] = useState(0);

  const handleTabChange = useStableCallback((index: number) => {
    setTabIndex(index);
  });

  return (
    <>
      <TabList
        activeTab={activeTabIndex}
        tabs={[
          { id: 1, title: "Overview", href: "/d/overview" },
          { id: 2, title: "Topic's", href: "/d/disscusions" },
          { id: 3, title: "Team's" },
          { id: 4, title: "People's", href: "/d/members" },
          { id: 4, title: "Settings" },
        ]}
        onSwitchTab={handleTabChange}
      />

      <Outlet />
    </>
  );
};

export default memo(RedditPage);
