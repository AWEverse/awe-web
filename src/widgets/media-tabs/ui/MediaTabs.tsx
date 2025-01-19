import { useStableCallback } from "@/shared/hooks/base";
import TabList from "@/shared/ui/TabList";
import { FC, memo, ReactNode, useState } from "react";

interface OwnProps {}

const DEFAULT_TABS = [
  { id: 0, title: "Story" },
  { id: 1, title: "Media" },
  { id: 2, title: "Files" },
  { id: 3, title: "Links" },
  { id: 4, title: "Polls" },
];

const MediaTabs: FC<OwnProps> = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleSwitchTab = useStableCallback((index: number) => {
    setActiveTab(index);
  });

  return (
    <section id="media-tabs">
      <TabList
        activeTab={activeTab}
        variant="pannels"
        tabs={DEFAULT_TABS}
        onSwitchTab={handleSwitchTab}
      />
    </section>
  );
};

export default memo(MediaTabs);
