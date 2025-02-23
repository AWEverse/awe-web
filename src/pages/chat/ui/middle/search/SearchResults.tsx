import buildClassName from "@/shared/lib/buildClassName";
import { motion, AnimatePresence } from "framer-motion";
import TabList from "@/shared/ui/TabList";
import { FC, memo, useEffect, useMemo, useState } from "react";
import SearchFooter from "./SearchFooter";
import s from "./SearchResults.module.scss";
import { useStableCallback } from "@/shared/hooks/base";
import { HandlerName } from "@/lib/utils/captureKeyboardListeners";
import SearchLastRequest from "./SearchLastRequest";
import SearchHistoryDropdown from "./SearchHistoryDropdown";

interface SearchResultsProps {
  isVisible: boolean;
  onEnter?: () => void;
  onEsc?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onTab?: () => void;
}

const FADE_DURATION_MS = 0.25;

const keyboardEventHandlers: HandlerName[] = [
  "onTab",
  "onUp",
  "onDown",
  "onEnter",
  "onEsc",
];

const tabItems = [
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

const SearchResults: FC<SearchResultsProps> = ({
  isVisible,
  ...keyboardActions
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const handleTabChange = useStableCallback(setActiveTabIndex);

  const isLoading = false;

  const mappedKeyboardActions = useMemo(
    () =>
      keyboardEventHandlers.map((handler: HandlerName) => ({
        key: handler,
        action: keyboardActions[handler as keyof typeof keyboardActions],
      })),
    [keyboardActions],
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: FADE_DURATION_MS }}
          className={buildClassName(
            s.SearchResults,
            isLoading && s.SearchResults__Loading,
          )}
        >
          <div className={s.SearchHeader}>
            <SearchHistoryDropdown />
            <TabList
              activeTab={activeTabIndex}
              className={s.TabBar}
              tabs={tabItems}
              variant="folders"
              onSwitchTab={handleTabChange}
            />
          </div>
          <div className={buildClassName(s.SearchContent, s.ResultsList)}>
            <SearchLastRequest active disabled body="Who is Andrii Volynets?" />
            <SearchLastRequest
              active
              body="Andrii Volynets: biography and achievements"
            />
            <SearchLastRequest disabled body="Latest news on Andrii Volynets" />
            <SearchLastRequest body="Andrii Volynets professional background" />
            <SearchLastRequest body="What is Andrii Volynets known for?" />
            <SearchLastRequest body="Contact information for Andrii Volynets" />
            <SearchLastRequest body="Andrii Volynets: recent projects and updates" />
          </div>
          <SearchFooter
            className={s.SearchFooter}
            formatString="{onTab} or {onUp} {onDown} to navigate {onEnter} to select {onEsc} to cancel"
            keys={mappedKeyboardActions}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(SearchResults);
