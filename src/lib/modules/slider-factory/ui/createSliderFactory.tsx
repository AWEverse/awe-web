import { FC, cloneElement, useState, useEffect, createRef, Suspense } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import usePrevious from '@/lib/hooks/state/usePrevious';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import SliderSkeleton from './SliderSkeleton';

const TRANSITION_DURATION = 300;

type TransitionCSS = Record<string, string> | string;

interface OwnProps {
  className?: string;
  currentScreen?: number;
  onScreenChange?: (screen: number) => void;
}

interface SliderFactoryProps {
  initialScreen: number;
  screens: Record<number, AnyToFunctionalComponent>;
  duration?: number;
  rightClassNames?: TransitionCSS;
  leftClassNames?: TransitionCSS;
  withSuspence?: boolean;
}

function createSliderFactory(args: SliderFactoryProps): FC<OwnProps> {
  const {
    initialScreen,
    screens,
    duration = TRANSITION_DURATION,
    rightClassNames,
    leftClassNames,
    withSuspence = false,
  } = args;

  const SliderFactory: FC<OwnProps> = ({ className, currentScreen, onScreenChange }) => {
    const [content, setContent] = useState<number>(initialScreen);

    const previousContent = usePrevious(content);
    const direction = previousContent !== undefined && previousContent < content;

    const currentRef = createRef<HTMLDivElement>();

    const CurrentScreen = screens[content];

    const handleScreenChange = useLastCallback((screen: number) => {
      setContent(screen);
      onScreenChange?.(screen);
    });

    useEffect(() => {
      if (currentScreen !== undefined && currentScreen !== content) {
        handleScreenChange(currentScreen);
      }
      /* 
        there is no need to depend on the content as it should only be changed by the current screen in the returned component. 
        Useful when state is stored externally
       */
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentScreen]);

    const renderContent = () =>
      withSuspence ? (
        <Suspense fallback={<SliderSkeleton />}>
          <CurrentScreen className={className} onScreenChange={handleScreenChange} />
        </Suspense>
      ) : (
        <CurrentScreen className={className} onScreenChange={handleScreenChange} />
      );

    return (
      <TransitionGroup
        childFactory={child =>
          cloneElement(child, {
            classNames: direction ? rightClassNames : leftClassNames,
            timeout: duration,
          })
        }
        component={null}
      >
        <CSSTransition key={content} nodeRef={currentRef} timeout={duration} unmountOnExit>
          <div ref={currentRef} className={className}>
            {renderContent()}
          </div>
        </CSSTransition>
      </TransitionGroup>
    );
  };

  return SliderFactory;
}

export default createSliderFactory;
