import { FC, useRef, memo, ReactNode } from "react";
import useHorizontalScroll from "@/shared/hooks/DOM/useHorizontalScroll";
import useHorizontalScrollToContanier from "../hooks/DOM/useHorizontalScrollToContanier";
import buildClassName from "../lib/buildClassName";
import Tab, { TabProps } from "./Tab";
import { capitalize } from "@/lib/utils/helpers/string/stringFormaters";
import "./TabList.scss";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";
import ContextMenu, {
  ContextMenuOptionType,
  useContextMenuHandlers,
} from "@/entities/context-menu";
import { EMouseButton } from "@/lib/core";
import { useFastClick } from "../hooks/mouse/useFastClick";
import ActionButton from "./ActionButton";

type TabProperty =
  | "title"
  | "badgeCount"
  | "isBlocked"
  | "isBadgeActive"
  | "href";
type TabWithProperties = {
  id: number | string;
} & Pick<TabProps, TabProperty>;

interface OwnProps {
  tabs: readonly TabWithProperties[];
  activeTab: number;
  className?: string;
  variant?: TabProps["variant"];
  onSwitchTab: (index: number) => void;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  disableScroll?: boolean;
  contextMenuOptions?: ContextMenuOptionType<number>[];
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
    contextMenuOptions,
  } = props;

  const uuid = useUniqueId("tab");
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldRenderContextMenu =
    contextMenuOptions && contextMenuOptions.length > 0;

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

  const {
    isContextMenuOpen,
    contextMenuAnchor,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuHide,
    handleContextMenuClose,
  } = useContextMenuHandlers({
    elementRef: containerRef,
    isMenuDisabled: !shouldRenderContextMenu,
    targets: ['[role="tab"]'],
  });

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!shouldRenderContextMenu && e.button === EMouseButton.Secondary) {
        handleBeforeContextMenu(e);
      }

      if (e.type === "mousedown" && e.button !== EMouseButton.Main) {
        return;
      }
    },
  );

  return (
    <>
      <nav aria-label="Tab navigation" className={tabListClassName}>
        {startDecorator}
        <div
          ref={containerRef}
          aria-orientation="horizontal"
          className="TabList-Section"
          role="tablist"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
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
      {contextMenuOptions && contextMenuOptions.length > 0 && (
        <ContextMenu
          isOpen={isContextMenuOpen}
          position={contextMenuAnchor!}
          onClose={handleContextMenuClose}
          onCloseAnimationEnd={handleContextMenuHide}
          withPortal
        >
          {contextMenuOptions.map(
            ({ icon, description, label, group, onClick }) => (
              <ActionButton
                size="sm"
                icon={icon}
                label={label}
                title={description}
              />
            ),
          )}
        </ContextMenu>
      )}
    </>
  );
};

export default memo(TabList);
export type { TabWithProperties };
