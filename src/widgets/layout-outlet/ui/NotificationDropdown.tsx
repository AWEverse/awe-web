import Dropdown, { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import MenuSeparator from "@/shared/ui/MenuSeparator";
import { NotificationsRounded, SettingsRounded } from "@mui/icons-material";
import { FC, memo, ReactNode, useState } from "react";
import "./NotificationDropdown.scss";
import TabList from "@/shared/ui/TabList";
import { usePrevious, useStableCallback } from "@/shared/hooks/base";

interface OwnProps {}

interface StateProps {}

const NotificationTriggerButton: FC<TriggerProps> = memo(({ onTrigger }) => {
  return (
    <IconButton onClick={onTrigger}>
      <NotificationsRounded />
    </IconButton>
  );
});

const NotificationDropdown: FC<OwnProps & StateProps> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTabChange = useStableCallback((index: number) => {
    setCurrentIndex(index);
  });

  return (
    <Dropdown
      triggerButton={NotificationTriggerButton}
      position="top-right"
      className="NotificationDropdown"
    >
      <div className="NotificationDropdown__Header">
        <span>Notifications</span>

        <IconButton>
          <SettingsRounded />
        </IconButton>
      </div>

      <MenuSeparator />

      <TabList
        tabs={tabsData}
        onSwitchTab={handleTabChange}
        activeTab={currentIndex}
      />
    </Dropdown>
  );
};

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

export default memo(NotificationDropdown);
