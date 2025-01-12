import { createElement, useState, useRef, JSX, FC, ReactElement, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import buildClassName from '@/shared/lib/buildClassName';

import s from './Collapsible.module.scss';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { CollapsibleContext, useCollapsible } from '../hooks/useCollapsible';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';
import { clamp } from '@/lib/core';

interface ContentProps {
  unmountOnExit?: boolean;
  contentClassName?: string;
  component?: keyof JSX.IntrinsicElements | null;
}

type DivProps = JSX.IntrinsicElements['div'];
type ButtonProps = JSX.IntrinsicElements['button'];

const MIN_DURATION = 150;
const MAX_DURATION = 500;
const MAX_HEIGHT = 1000;

const classNames = {
  enter: s.enter,
  enterActive: s.enterActive,
  exit: s.exit,
  exitActive: s.exitActive,
};

const calculateDuration = (height: number): number => {
  const duration = (height / MAX_HEIGHT) * (MAX_DURATION - MIN_DURATION) + MIN_DURATION;

  return clamp(duration, MIN_DURATION, MAX_DURATION);
};

const Content: FC<ContentProps & DivProps> = ({
  children,
  className,
  component = 'div',
  contentClassName,
  unmountOnExit = true,
  ...props
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { isOpen } = useCollapsible();

  const [duration, setDuration] = useState(MIN_DURATION);

  const styles = { transitionDuration: `${duration}ms` };

  useEffect(() => {
    const node = nodeRef.current;

    if (!node) return;

    requestMeasure(() => {
      const height = node.scrollHeight;
      const newDuration = calculateDuration(height);

      setDuration(prevDuration => (prevDuration !== newDuration ? newDuration : prevDuration));
    });
  }, [isOpen]);

  const renderChild = () => (
    <CSSTransition
      classNames={classNames}
      in={isOpen}
      nodeRef={nodeRef}
      timeout={duration}
      unmountOnExit={unmountOnExit}
    >
      <div
        ref={nodeRef}
        className={buildClassName(s.Content, contentClassName)}
        style={styles}
        {...props}
      >
        {children}
      </div>
    </CSSTransition>
  );

  const element =
    component !== null
      ? (createElement(component, {
          className: buildClassName(s.root, className),
          children: renderChild(),
        }) as ReactElement)
      : renderChild();

  return element;
};

interface TriggerProps {
  onOpenChange?: (open: boolean) => void;
}

const Trigger: FC<TriggerProps & ButtonProps> = ({
  children,
  onClick,
  onMouseDown,
  onOpenChange,
  className,
  ...props
}) => {
  const { isOpen, toggleCollapse } = useCollapsible();

  const handleClick = useLastCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    toggleCollapse();
    onClick?.(e);
    onOpenChange?.(!isOpen);
  });

  return (
    <button
      className={buildClassName(s.trigger, className)}
      type="button"
      onClick={handleClick}
      onMouseDown={onMouseDown}
      {...props}
    >
      {children}
    </button>
  );
};

interface RootProps {
  title?: string;
  component?: keyof JSX.IntrinsicElements | null;
}

const Root: FC<RootProps & DivProps> = ({
  title,
  children,
  className,
  component = 'div',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = useLastCallback(() => {
    setIsOpen(prev => !prev);
  });

  const element =
    component !== null ? (
      (createElement(component, {
        title: title,
        className: buildClassName(s.root, className),
        children,
        ...props,
      }) as ReactElement)
    ) : (
      <>{children}</>
    );

  return (
    <CollapsibleContext.Provider value={{ isOpen, toggleCollapse }}>
      {element}
    </CollapsibleContext.Provider>
  );
};

export { Root, Trigger, Content };
