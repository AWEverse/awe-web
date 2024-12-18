import { requestMutation, requestForcedReflow } from '@/lib/modules/fastdom/fastdom';
import { FC, useRef, useLayoutEffect, useEffect } from 'react';
import buildClassName from '../lib/buildClassName';
import './Tab.scss';
import { MouseButton } from '@/lib/utils/OS/windowEnviroment';
import { useFastClick } from '../hooks/useFastClick';
import { capitalize } from '@/lib/utils/helpers/string/stringFormaters';

type OwnProps = {
  className?: string;
  title: string;
  isActive?: boolean;
  isBlocked?: boolean;
  badgeCount?: number;
  isBadgeActive?: boolean;
  previousActiveTab?: number;
  onClick?: (arg: number) => void;
  clickArg?: number;
  variant: 'folders' | 'pannels' | 'fill';
  tabIndex?: number;
};

const classNames = {
  active: 'Tab-active',
  badgeActive: 'Tab-badge-active',
};

const ANIMATE_KEY = 'animate';

const Tab: FC<OwnProps> = ({
  className,
  title,
  isActive,
  isBlocked,
  badgeCount,
  isBadgeActive,
  previousActiveTab,
  onClick,
  clickArg,
  variant = 'pannels',
  tabIndex = 0,
}) => {
  const tabRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const tabEl = tabRef.current;
    const bShouldAddActiveClass = isActive && !previousActiveTab && tabEl;

    if (bShouldAddActiveClass) {
      tabEl.classList.add(classNames.active);
    }
  }, [isActive, previousActiveTab]);

  useEffect(() => {
    if (!isActive || previousActiveTab === undefined) {
      return;
    }

    const tabEl = tabRef.current!;

    if (!tabEl) {
      return;
    }

    const prevTabEl = tabEl.parentElement!.children[previousActiveTab];

    if (!prevTabEl) {
      const bShouldAddActiveClass = !tabEl.classList.contains(classNames.active);

      if (bShouldAddActiveClass) {
        requestMutation(() => {
          tabEl.classList.add(classNames.active);
        });
      }

      return;
    }

    const platformEl = tabEl.querySelector<HTMLElement>('.platform')!;
    const prevPlatformEl = prevTabEl.querySelector<HTMLElement>('.platform')!;

    if (!prevPlatformEl.parentElement || !platformEl.parentElement) {
      return;
    }

    requestMutation(() => {
      prevPlatformEl.classList.remove(ANIMATE_KEY);

      platformEl.classList.remove(ANIMATE_KEY);
      platformEl.style.transform = buildTransform(prevPlatformEl, platformEl);

      requestForcedReflow(() => {
        forceReflow(platformEl);

        return () => {
          platformEl.classList.add(ANIMATE_KEY);
          platformEl.style.transform = 'none';

          prevTabEl.classList.remove(classNames.active);
          tabEl.classList.add(classNames.active);
        };
      });
    });
  }, [isActive, previousActiveTab]);

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.type === 'mousedown' && e.button !== MouseButton.Main) {
        return;
      }

      onClick?.(clickArg!);
    },
  );

  return (
    <button
      ref={tabRef}
      aria-label={title}
      aria-selected={isActive}
      className={buildClassName('Tab', onClick && 'Tab-interactive', className)}
      role="tab"
      tabIndex={tabIndex}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <span className={buildClassName('TabInner', capitalize(variant))} data-active={isActive}>
        {title}
        {Boolean(badgeCount) && (
          <span
            aria-label={`Notifications: ${badgeCount}`}
            className={buildClassName('badge', isBadgeActive && classNames.badgeActive)}
            role="alert"
          >
            {badgeCount}
          </span>
        )}
        {isBlocked && <i aria-hidden="true" className="icon icon-lock-badge blocked" />}
        <i className={buildClassName('platform', `platform-${variant}`)}>
          <span className="platform-inner-pannels" />
        </i>
      </span>
    </button>
  );
};

function forceReflow(element: HTMLElement) {
  element.offsetWidth;
}

const buildTransform = (prevPlatformEl: HTMLElement, currPlatformEl: HTMLElement) => {
  const prevParent = prevPlatformEl.parentElement;
  const currParent = currPlatformEl.parentElement;

  if (!prevParent || !currParent) {
    return 'none';
  }

  const shiftLeft = prevParent.offsetLeft - currParent.offsetLeft;
  const scaleFactor = prevPlatformEl.clientWidth / currPlatformEl.clientWidth;

  return `translate3d(${shiftLeft}px, 0, 0) scale3d(${scaleFactor}, 1, 1)`;
};

export default Tab;
export type { OwnProps as TabProps };
