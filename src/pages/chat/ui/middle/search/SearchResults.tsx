import buildClassName from '@/shared/lib/buildClassName';
import LightEffect from '@/shared/ui/common/LightEffect';
import TabList from '@/shared/ui/TabList';
import { createRef, FC, useEffect, useMemo, useState } from 'react';
import SearchFooter from './SearchFooter';
import { CSSTransition } from 'react-transition-group';

import s from './SearchResults.module.scss';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { HandlerName } from '@/lib/utils/captureKeyboardListeners';
import LastRequest from './LastRequest';
import SearchHistoryDropdown from './SearchHistoryDropdown';

interface SearchResultsProps {
  isVisible: boolean;
  onEnter?: NoneToVoidFunction | undefined;
  onEsc?: NoneToVoidFunction | undefined;
  onUp?: NoneToVoidFunction | undefined;
  onDown?: NoneToVoidFunction | undefined;
  onTab?: NoneToVoidFunction | undefined;
}

const FADE_DURATION_MS = 300;
const keyboardEventHandlers: HandlerName[] = ['onTab', 'onUp', 'onDown', 'onEnter', 'onEsc'];

const tabItems = [
  { id: 1, title: 'All', badgeCount: 2, isBlocked: false, isBadgeActive: true },
  { id: 2, title: 'Friends', badgeCount: 0, isBlocked: false, isBadgeActive: false },
  { id: 3, title: 'Groups', badgeCount: 0, isBlocked: false, isBadgeActive: false },
  { id: 4, title: 'Archived', badgeCount: 0, isBlocked: false, isBadgeActive: false },
  { id: 5, title: 'Starred', badgeCount: 0, isBlocked: false, isBadgeActive: false },
  { id: 6, title: 'Muted', badgeCount: 0, isBlocked: false, isBadgeActive: false },
];

const SearchResults: FC<SearchResultsProps> = ({ isVisible, ...keyboardActions }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const searchResultsRef = createRef<HTMLDivElement>();

  const handleTabChange = useLastCallback(setActiveTabIndex);

  const isLoading = false;

  const mappedKeyboardActions = useMemo(
    () =>
      keyboardEventHandlers.map((handler: HandlerName) => ({
        key: handler,
        action: keyboardActions[handler as keyof typeof keyboardActions],
      })),
    Object.values(keyboardActions),
  );

  return (
    // Replace to fade
    <CSSTransition
      unmountOnExit
      classNames="zoomIn"
      in={isVisible}
      nodeRef={searchResultsRef}
      timeout={FADE_DURATION_MS}
    >
      <div
        ref={searchResultsRef}
        className={buildClassName(s.SearchResults, isLoading && s.SearchResults__Loading)}
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
          <LastRequest active disabled body="Who is Andrii Volynets?" />
          <LastRequest active body="Andrii Volynets: biography and achievements" />
          <LastRequest disabled body="Latest news on Andrii Volynets" />
          <LastRequest body="Andrii Volynets professional background" />
          <LastRequest body="What is Andrii Volynets known for?" />
          <LastRequest body="Contact information for Andrii Volynets" />
          <LastRequest body="Andrii Volynets: recent projects and updates" />
        </div>

        <SearchFooter
          className={s.SearchFooter}
          formatString="{onTab} or {onUp} {onDown} to navigate {onEnter} to select {onEsc} to cancel"
          keys={mappedKeyboardActions}
        />
        <LightEffect gridRef={searchResultsRef} lightSize={1200} />
      </div>
    </CSSTransition>
  );
};

export default SearchResults;
