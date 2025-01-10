import useLastCallback from '@/lib/hooks/events/useLastCallback';
import RippleEffect from '@/shared/ui/ripple-effect';
import { FC, useState, useMemo, memo } from 'react';

import s from './PinnedMessageButton.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import Image from '@/shared/ui/Image';

interface OwnProps {
  nodeRef?: React.Ref<HTMLDivElement>;
  className?: string;
  children?: React.ReactNode;
  segmentCount?: number;
  style?: React.CSSProperties;
  onClick?: (index: number) => void;
}

interface StateProps {
  activeIndex: number;
}

const PinnedMessageButton: FC<OwnProps & StateProps> = props => {
  const { nodeRef, className, children, segmentCount = 4, style, onClick } = props;

  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = useLastCallback(() => {
    setActiveIndex(prev => (prev + 1) % segmentCount);
    onClick?.(activeIndex);
  });

  const segments = useMemo(
    () =>
      Array.from({ length: segmentCount }).map((_, index) => (
        <div
          key={index}
          aria-hidden={index !== activeIndex}
          className={s.rollerSegment}
          data-active={index === activeIndex}
        ></div>
      )),
    [segmentCount, activeIndex],
  );

  return (
    <section
      ref={nodeRef}
      aria-pressed={activeIndex >= 0}
      className={buildClassName(s.pinnedMessageWrapper, className)}
      role="button"
      style={style}
      onClick={handleClick}
    >
      <div aria-live="polite" className={s.roller} data-segment-count={segmentCount}>
        {segments}
      </div>
      {/* <Image
        width={12}
        height={12}
        alt={`Pinned message avatar #${activeIndex + 1}`}
        src="https://i.pravatar.cc/300"
      /> */}
      <div className={s.pinnedMessageItem}>
        <h5 className={s.pinnedAdditionalInfo}>Pinned message #{activeIndex + 1}</h5>
        <p className={s.pinnedMessageText}>This is a pinned message</p>
      </div>
      {children}
      <RippleEffect />
    </section>
  );
};

export default memo(PinnedMessageButton);
