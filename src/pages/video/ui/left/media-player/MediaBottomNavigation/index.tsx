import { FC, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import TrackNavigation from '@/shared/ui/TrackNavigation';
import FirstSlide from './slides/FirstSlide';
import SecondSlide from './slides/SecondSlide';
import s from './index.module.scss';
import useConditionalRef from '@/lib/hooks/utilities/useConditionalRef';

const MAX_SLIDES = 2;
const TRANSITION_DURATION = 250;

const MediaBottomNavigation: FC = () => {
  const [index, setIndex] = useState(0);

  const onSlideChange = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    setIndex(prevIndex => (prevIndex === MAX_SLIDES - 1 ? 0 : prevIndex + 1));
  };

  const currentSlide = index === 0 ? <FirstSlide /> : <SecondSlide />;
  const slideDirection = index === 0 ? 'toTop' : 'toBottom';

  const transitionRef = useConditionalRef<HTMLDivElement>(null, [index]);

  return (
    <section className={s.MediaNavigation} onClick={onSlideChange}>
      <TrackNavigation count={MAX_SLIDES} index={index} />
      <TransitionGroup component={null}>
        <CSSTransition
          nodeRef={transitionRef}
          key={slideDirection}
          timeout={TRANSITION_DURATION}
          classNames={slideDirection}
        >
          <div ref={transitionRef} className={s.slide}>
            {currentSlide}
          </div>
        </CSSTransition>
      </TransitionGroup>
    </section>
  );
};

export default MediaBottomNavigation;
