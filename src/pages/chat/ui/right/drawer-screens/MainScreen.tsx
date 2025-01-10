import { FC, memo, useRef, useState } from 'react';
import InfoSection from './main-sections/InfoSection';
import HeaderNavigation from '../../common/HeaderNavigation';
import useChatStore from '@/pages/chat/store/useChatSelector';
import IconButton from '@/shared/ui/IconButton';
import { EditRounded } from '@mui/icons-material';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import TabList from '@/shared/ui/TabList';
import Square from '@/entities/album-layout/ui/Square';

import s from './MainScreen.module.scss';
import useFloatingButton from '../../hooks/useFloatingButton';
import buildClassName from '@/shared/lib/buildClassName';
import TallyCounter from '@/shared/ui/tally-counter/ui/TallyCounter';
import { IS_TOUCH_ENV } from '@/lib/core';

interface OwnProps {
  nodeRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const MainScreen: FC<OwnProps> = ({ nodeRef, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const closeProfileColumn = useChatStore(state => state.closeProfileColumn);
  const openProfileEditing = useChatStore(state => state.openProfileEditing);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [columnsCount, setColumnsCount] = useState(1);

  const handleTabChange = useLastCallback((index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  });

  const handleColumnsChange = useLastCallback((index: number) => {
    if (index !== columnsCount) {
      setColumnsCount(index);
    }
  });

  const { isButtonVisible, handleMouseEnter, handleMouseLeave } = useFloatingButton(
    IS_TOUCH_ENV,
    false,
  );

  return (
    <div
      ref={nodeRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={s.MainScreenBody}>
        <HeaderNavigation
          className={'RightHeaderNavigation'}
          endDecorator={
            <IconButton onClick={openProfileEditing}>
              <EditRounded />
            </IconButton>
          }
          name="Andrii Volynets"
          onPrevClick={closeProfileColumn}
        />
        <InfoSection />

        <TabList
          activeTab={currentIndex}
          className={s.TabListFolders}
          tabs={tabsData}
          variant="folders"
          onSwitchTab={handleTabChange}
        />

        <Square className={s.Square} containerRef={containerRef} currentColumn={columnsCount}>
          {Array.from({ length: 50 }, (_, i) => (
            <img
              key={i}
              alt=""
              src="https://picsum.photos/200"
              style={{ width: '100%', height: '100%', padding: '2px' }}
            />
          ))}
        </Square>
      </div>
      <TallyCounter
        loop
        className={buildClassName(s.MainScreenFab, isButtonVisible && s.FabVisible)}
        initialValue={1}
        range={[1, 6]}
        size="bigger"
        onChange={handleColumnsChange}
      />
    </div>
  );
};

const tabsData = [
  { id: 1, title: 'All', badgeCount: 5, isBlocked: false, isBadgeActive: true },
  { id: 2, title: 'Friends', badgeCount: 3, isBlocked: false, isBadgeActive: false },
  { id: 3, title: 'Groups', badgeCount: 2, isBlocked: false, isBadgeActive: true },
  { id: 4, title: 'Archived', badgeCount: 0, isBlocked: false, isBadgeActive: false },
  { id: 5, title: 'Starred', badgeCount: 0, isBlocked: false, isBadgeActive: false },
  { id: 6, title: 'Muted', badgeCount: 0, isBlocked: false, isBadgeActive: false },
];

export default memo(MainScreen);
