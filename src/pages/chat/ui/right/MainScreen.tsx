import React, {
  FC,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import HeaderNavigation from "../common/HeaderNavigation";
import IconButton from "@/shared/ui/IconButton";
import { EditRounded } from "@mui/icons-material";
import { useStableCallback } from "@/shared/hooks/base";
import TabList from "@/shared/ui/TabList";
import { IS_TOUCH_ENV } from "@/lib/core";
import { ScrollProvider } from "@/shared/context";
import useChatStore from "@/pages/chat/store/useChatSelector";
import InfoSection from "./common/InfoSection";
import { AnimatePresence, motion } from "framer-motion";
import MemberCard from "@/entities/MemberCard";
import MediaSection from "./main/MediaSection";
import { RTL_SLIDE, LTL_SLIDE } from "@/shared/animations/slideInVariant";
import useFloatingButton from "../hooks/useFloatingButton";
import buildClassName from "@/shared/lib/buildClassName";
import TallyCounter from "@/shared/ui/tally-counter/ui/TallyCounter";
import s from "./MainScreen.module.scss";
import MembersSection from "./main/MembersSection";
import { usePanelStack } from "@/entities/panel-navigator";
import PanelNavigator from "@/entities/panel-navigator/ui/PanelNavigator";
import { requestMutation, requestNextMutation } from "@/lib/modules/fastdom";
import useSignal from "@/lib/hooks/signals/useSignal";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";

interface TabData {
  id: number;
  title: string;
  badgeCount: number;
  isBlocked: boolean;
  isBadgeActive: boolean;
}

interface OwnProps {
  nodeRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const tabsData: TabData[] = [
  { id: 1, title: "All", badgeCount: 5, isBlocked: false, isBadgeActive: true },
  {
    id: 2,
    title: "Friends",
    badgeCount: 3,
    isBlocked: false,
    isBadgeActive: false,
  },
  {
    id: 3,
    title: "Groups",
    badgeCount: 2,
    isBlocked: false,
    isBadgeActive: true,
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

const Screens = {
  Members: MembersSection,
  Media: MediaSection,
  Saved: () => <div style={{ height: "500px", width: "420px" }}>Saved</div>,
  Files: () => <div style={{ height: "500px", width: "420px" }}>Files</div>,
  Links: () => <div style={{ height: "500px", width: "420px" }}>Links</div>,
  Music: () => <div style={{ height: "500px", width: "420px" }}>Music</div>,
  Voices: () => <div style={{ height: "500px", width: "420px" }}>Voices</div>,
} as const;

const MainScreen: FC<OwnProps> = ({ nodeRef, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableChildRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useStableCallback(() => {
    const container = containerRef.current;
    const childContainer = scrollableChildRef.current;

    if (!container || !childContainer) return;

    requestNextMutation(() => {
      const nAnchor = container.scrollHeight - childContainer.scrollHeight - 38;

      return () => {
        container.scrollTo({ top: nAnchor, behavior: "smooth" });
      };
    });
  });

  const { toggleProfileColumn, toggleProfileEditing } = useChatStore();
  const { stack, reset } = usePanelStack([
    { key: "tab-0", component: Screens.Members, direction: "backward" },
  ]);

  const currentTabIndex = useMemo(() => {
    const key = stack.at(-1)?.key ?? "tab-0";
    return Number.parseInt(key.split("-")[1] || "0", 10);
  }, [stack]);

  const handleTabChange = useStableCallback((index: number) => {
    scrollToTop();

    const component = Object.values(Screens)[index] ?? Screens.Members;
    reset({ key: `tab-${index}`, component }, currentTabIndex, index);
  });

  const tabContextOptions = useMemo(
    () => [
      {
        label: "Previous",
        onClick: () =>
          handleTabChange(
            (currentTabIndex - 1 + tabsData.length) % tabsData.length,
          ),
        description: "Switch to Previous Tab",
      },
      {
        label: "Next",
        onClick: () => handleTabChange((currentTabIndex + 1) % tabsData.length),
        description: "Switch to Next Tab",
      },
      {
        label: "Close",
        onClick: () => {}, // future use
        description: "Close Tab",
      },
    ],
    [currentTabIndex, handleTabChange],
  );

  return (
    <ScrollProvider containerRef={containerRef}>
      <div
        ref={containerRef}
        data-scrollable-parent
        className={s.MainScreenBody}
        onScroll={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <HeaderNavigation
          className="RightHeaderNavigation"
          endDecorator={
            <IconButton onClick={toggleProfileEditing}>
              <EditRounded />
            </IconButton>
          }
          name="Andrii Volynets"
          onPrevClick={toggleProfileColumn}
        />

        <InfoSection />

        <TabList
          activeTab={currentTabIndex}
          className={s.TabListFolders}
          tabs={tabsData}
          variant="folders"
          onSwitchTab={handleTabChange}
          contextMenuOptions={tabContextOptions}
        />

        <div
          ref={scrollableChildRef}
          data-scrollable-child
          className={"ChatProfileTabs"}
          onScroll={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <PanelNavigator stack={stack} />
        </div>
      </div>
    </ScrollProvider>
  );
};

export default memo(MainScreen);
