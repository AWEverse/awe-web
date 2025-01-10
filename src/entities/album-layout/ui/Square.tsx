import { Children, FC, ReactNode, useMemo, RefObject } from 'react';
import s from './Square.module.scss';
import buildStyle from '@/shared/lib/buildStyle';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import usePrevious from '@/lib/hooks/state/usePrevious';
import buildClassName from '@/shared/lib/buildClassName';
import useConditionalRef from '@/lib/hooks/utilities/useConditionalRef';

interface OwnProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  currentColumn?: number;
  className?: string;
  children: ReactNode;
  onMouseOver?: (e: React.MouseEvent) => void;
}

const Square: FC<OwnProps> = ({
  containerRef,
  currentColumn = 1,
  className,
  children,
  onMouseOver,
}) => {
  const previouscurrentColumn = usePrevious(currentColumn);

  const renderedChildren = useMemo(
    () =>
      Children.map(children, (child, index) => (
        <div key={`square-item-${index}`} className={s.square}>
          {child}
        </div>
      )),
    [children],
  );

  const nodeRef = useConditionalRef<HTMLDivElement>(null, [currentColumn]);

  return (
    <div
      ref={containerRef}
      className={buildClassName(s.AlbumSquareWrapper, className)}
      onMouseOver={onMouseOver}
    >
      <TransitionGroup component={null}>
        <CSSTransition
          key={currentColumn}
          classNames={currentColumn > previouscurrentColumn! ? 'zoomIn' : 'zoomOut'}
          nodeRef={nodeRef}
          timeout={300}
        >
          <section
            ref={nodeRef}
            className={s.AlbumSquare}
            style={buildStyle(`--grid-columns: ${currentColumn}`)}
          >
            {renderedChildren}
          </section>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

export default Square;
