import { FC, memo, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import s from './FadeText.module.scss';
import useInterval from '@/lib/hooks/shedulers/useInterval';
import buildClassName from '../lib/buildClassName';

const DEFAULT_TRANSITION_DELAY = 300;
const DEFAULT_ANIMATION_CLASSES = {
  fade: {
    enter: s.FadeEnter,
    exit: s.FadeExit,
    enterActive: s.FadeEnterActive,
    exitActive: s.FadeExitActive,
  },
  slide: {
    enter: s.SlideEnter,
    exit: s.SlideExit,
    enterActive: s.SlideEnterActive,
    exitActive: s.SlideExitActive,
  },
};

interface OwnProps {
  className?: string;
  texts: string[];
  interval?: number;
  transitionDelay?: number;
  animationType?: 'fade' | 'slide';
  customAnimationClasses?: {
    enter: string;
    exit: string;
    enterActive: string;
    exitActive: string;
  };
}

const FadeText: FC<OwnProps> = ({
  texts,
  interval = 3000,
  transitionDelay = DEFAULT_TRANSITION_DELAY,
  animationType = 'fade',
  customAnimationClasses,
  className,
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inProp, setInProp] = useState(true);

  const lastIndex = texts.length - 1;
  const currentText = texts[currentIndex];

  // Determine the animation classes based on props
  const animationClasses = customAnimationClasses || DEFAULT_ANIMATION_CLASSES[animationType];

  useInterval(
    () => {
      setInProp(false);

      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex === lastIndex ? 0 : prevIndex + 1));
        setInProp(true);
      }, transitionDelay);
    },
    interval,
    true,
  );

  return (
    <CSSTransition classNames={animationClasses} in={inProp} nodeRef={textRef} timeout={transitionDelay}>
      <div
        ref={textRef}
        aria-describedby={currentText}
        className={buildClassName(s.FadeText, className)}
        data-index={currentIndex}
      >
        {currentText}
      </div>
    </CSSTransition>
  );
};

export default memo(FadeText);
