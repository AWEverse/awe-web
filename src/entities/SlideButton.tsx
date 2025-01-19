import { Children, createRef, FC, memo, ReactNode, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ActionButton from "@/shared/ui/ActionButton"; // Assuming you have this component
import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";

import s from "./SlideButton.module.scss";

interface OwnProps {
  children: ReactNode;
}

const SlideButton: FC<OwnProps> = ({ children }) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const totalSlides = Children.count(children);
  const currentRef = createRef<HTMLDivElement>();

  const handleNextSlide = useStableCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    setSlideIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  });

  return (
    <ActionButton onClick={handleNextSlide} labelClassName={s.SlideButtonRoot}>
      <TransitionGroup component={null}>
        <CSSTransition
          key={slideIndex}
          timeout={500}
          classNames={"toBottom"}
          nodeRef={currentRef}
        >
          <div ref={currentRef} className={s.SlideChild}>
            {Children.toArray(children)[slideIndex]}
          </div>
        </CSSTransition>
      </TransitionGroup>
    </ActionButton>
  );
};

export default memo(SlideButton);
