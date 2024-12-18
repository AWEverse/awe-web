import { ApiMessageEntityTypes } from '@/@types/api/types/messages';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { ReactNode, useRef } from 'react';
import useCollapsibleLines from '../hooks/useCollapsible';
import buildClassName from '../lib/buildClassName';
import s from './Blockquote.module.scss';
import { ArrowDownwardRounded, ArrowUpwardRounded } from '@mui/icons-material';

type OwnProps = {
  canBeCollapsible?: boolean;
  isToggleDisabled?: boolean;
  children: ReactNode;
};

const MAX_LINES = 4;

const Blockquote = ({ canBeCollapsible, isToggleDisabled, children }: OwnProps) => {
  // eslint-disable-next-line no-null/no-null
  const ref = useRef<HTMLQuoteElement>(null);
  const { isCollapsed, isCollapsible, setIsCollapsed } = useCollapsibleLines(
    ref,
    MAX_LINES,
    undefined,
    !canBeCollapsible,
  );

  const canExpand = !isToggleDisabled && isCollapsed;

  const handleExpand = useLastCallback(() => {
    setIsCollapsed(false);
  });

  const handleToggle = useLastCallback(() => {
    setIsCollapsed(prev => !prev);
  });

  return (
    <span className={s.root} onClick={canExpand ? handleExpand : undefined}>
      <blockquote
        ref={ref}
        data-entity-type={ApiMessageEntityTypes.Blockquote}
        className={buildClassName(s.blockquote, isCollapsed && s.expanded)}
      >
        <div className={buildClassName(s.gradientContainer, isCollapsed && s.collapsed)}>
          {children}
        </div>
        {isCollapsible && (
          <div
            className={buildClassName(s.collapseIcon, !isToggleDisabled && s.clickable)}
            onClick={!isToggleDisabled ? handleToggle : undefined}
            aria-hidden
          >
            {!isCollapsed ? <ArrowUpwardRounded /> : <ArrowDownwardRounded />}
          </div>
        )}
      </blockquote>
    </span>
  );
};

export default Blockquote;
