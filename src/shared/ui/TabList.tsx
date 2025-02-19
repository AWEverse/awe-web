import { FC, useRef, memo, ReactNode } from "react";
import useHorizontalScroll from "@/shared/hooks/DOM/useHorizontalScroll";
import useHorizontalScrollToContanier from "../hooks/DOM/useHorizontalScrollToContanier";
import buildClassName from "../lib/buildClassName";
import Tab, { TabProps } from "./Tab";
import { capitalize } from "@/lib/utils/helpers/string/stringFormaters";
import "./TabList.scss";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";

type TabProperty = "title" | "badgeCount" | "isBlocked" | "isBadgeActive";
type TabWithProperties = { id: number | string } & Pick<TabProps, TabProperty>;

interface OwnProps {
  tabs: readonly TabWithProperties[];
  activeTab: number;
  className?: string;
  variant: TabProps["variant"];
  onSwitchTab: (index: number) => void;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  disableScroll?: boolean;
}

const TabList: FC<OwnProps> = (props) => {
  const {
    tabs,
    activeTab,
    className,
    variant = "folders",
    onSwitchTab,
    startDecorator,
    endDecorator,
    disableScroll = false,
  } = props;

  const uuid = useUniqueId("tab");
  const containerRef = useRef<HTMLDivElement>(null);

  const isFolderVariant = variant === "folders";
  const tabListClassName = buildClassName(
    "TabList",
    `TabList-${capitalize(variant)}`,
    "no-scrollbar",
    className,
  );

  useHorizontalScroll(containerRef, {
    isDisabled: disableScroll,
    shouldPreventDefault: true,
    scrollSpeedMultiplier: 1,
  });

  useHorizontalScrollToContanier(containerRef, activeTab);

  return (
    <nav aria-label="Tab navigation" className={tabListClassName}>
      {startDecorator}
      <div
        ref={containerRef}
        aria-orientation="horizontal"
        className="TabList-Section"
        role="tablist"
      >
        {tabs.map(({ id, title, ...tabProps }, index) => {
          const key = `${id}_${title}`;
          const isActive = index === activeTab;
          const currentTitle =
            !isFolderVariant && title === "All" ? "All folders" : title;
          const tabIndex = isActive ? 0 : -1;

          return (
            <Tab
              layoutId={uuid}
              key={key}
              aria-selected={isActive}
              clickArg={index}
              isActive={isActive}
              tabIndex={tabIndex}
              title={currentTitle}
              variant={variant}
              onClick={onSwitchTab}
              {...tabProps}
            />
          );
        })}
      </div>
      {endDecorator}
    </nav>
  );
};

export default memo(TabList);
export type { TabWithProperties };
