import buildClassName from '@/shared/lib/buildClassName';
import { FC, lazy, memo } from 'react';

const MainScreen = lazy(() => import('./screens/MainScreen'));
const ArchivedScreen = lazy(() => import('./screens/ArchivedScreen'));
const CreateNewScreen = lazy(() => import('./screens/CreateNewScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const ContactsScreen = lazy(() => import('./screens/ContactsScreen'));

import createSliderFactory from '@/lib/modules/slider-factory';
import useChatStore from '../../store/useChatSelector';
import { LeftColumnScreenType } from '../../types/LeftColumn';
import s from './LeftColumn.module.scss';

interface OwnProps {
  className?: string;
  unmountOnExit?: boolean;
}

const LeftColumnFactory = createSliderFactory({
  initialScreen: LeftColumnScreenType.Main,
  screens: {
    [LeftColumnScreenType.Main]: MainScreen,
    [LeftColumnScreenType.Settings]: SettingsScreen,
    [LeftColumnScreenType.Archived]: ArchivedScreen,
    [LeftColumnScreenType.Creator]: CreateNewScreen,
    [LeftColumnScreenType.Contacts]: ContactsScreen,
  },
  rightClassNames: 'rightToLeft',
  leftClassNames: 'leftToRight',
  withSuspence: true,
});

const LeftColumn: FC<OwnProps> = ({ className }) => {
  const isOpen = useChatStore(state => state.isChatList);
  const currentScreen = useChatStore(state => state.screen);

  return (
    <section
      className={buildClassName(s.LeftColumnRoot, className)}
      data-placement={isOpen ? 'show' : 'hide'}
    >
      <LeftColumnFactory className={s.SliderColumn} currentScreen={currentScreen} />
    </section>
  );
};

export default memo(LeftColumn);
