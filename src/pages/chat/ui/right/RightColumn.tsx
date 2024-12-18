import { cloneElement, createRef, FC, memo } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import DrawerColumn from './DrawerColumn';
import EditScreen from './drawer-screens/EditScreen';
import MainScreen from './drawer-screens/MainScreen';
import './RightColumn.scss';
import useChatStore from '../../store/useChatSelector';
import useConditionalRef from '@/lib/hooks/utilities/useConditionalRef';

const TRANSITION_DURATION = 300; //ms

const Slider = () => {
  const isOpen = useChatStore(state => state.isProfileEditing);

  const nodeRef = useConditionalRef<HTMLDivElement>(null, [isOpen]);

  return (
    <TransitionGroup
      childFactory={child =>
        cloneElement(child, {
          classNames: isOpen ? 'right-to-left' : 'left-to-right',
          timeout: TRANSITION_DURATION,
        })
      }
      component={null}
    >
      <CSSTransition key={isOpen ? 'edit' : 'main'} nodeRef={nodeRef} timeout={TRANSITION_DURATION}>
        {isOpen ? (
          <EditScreen className="SliderColumn" nodeRef={nodeRef} />
        ) : (
          <MainScreen className="SliderColumn" nodeRef={nodeRef} />
        )}
      </CSSTransition>
    </TransitionGroup>
  );
};

const RightColumn: FC = () => {
  return (
    <DrawerColumn>
      <Slider />
    </DrawerColumn>
  );
};

export default memo(RightColumn);
