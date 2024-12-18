import { Collapsible } from '@/shared/ui/collapsible';
import { HelpOutline } from '@mui/icons-material';
import { FC, memo, ReactNode, useCallback } from 'react';

import s from './SettingsButton.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import buildStyle from '@/shared/lib/buildStyle';
import useScaledSelection, { sizePattern } from '@/lib/hooks/ui/useScaledSelection';
import stopEvent from '@/lib/utils/stopEvent';

interface OwnProps {
  wrapperClassName?: string;
  className?: string;
  settingIcon?: ReactNode;
  children?: ReactNode;
  settingName?: string;
  onHelpClick?: () => void;
  onClick?: () => void;
}

const SettingsButton: FC<OwnProps> = props => {
  const { className, wrapperClassName, settingIcon, children, settingName, onHelpClick, onClick } =
    props;

  const { handleMouseOver, rootRef, dimensions } = useScaledSelection<HTMLDivElement>({
    shouldSkipNode: (target: HTMLElement) => target.id === 'setting-name',
  });

  const handleHelpClick = useCallback(
    (e: React.MouseEvent) => {
      stopEvent(e);
      onHelpClick?.();
    },
    [onHelpClick],
  );

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const styles = buildStyle(
    `--child-height: ${sizePattern(dimensions.height)}`,
    `--child-width: ${sizePattern(dimensions.width)}`,
    `--child-x: ${dimensions.x}px`,
    `--child-y: ${dimensions.y}px`,
  );

  return (
    <Collapsible.Root aria-labelledby="setting-name" className={wrapperClassName} component={null}>
      <div
        ref={rootRef}
        aria-expanded="false"
        className={buildClassName(s.SettingButtonWrapper, className, 'ScaledSelection')}
        role="button"
        style={styles}
        tabIndex={0}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
      >
        <div aria-hidden="true" className={s.SettingIcon}>
          {settingIcon}
        </div>
        <span className={s.SettingName} id="setting-name">
          {settingName}
        </span>
        <Collapsible.Trigger
          aria-label={`Get help for ${settingName}`}
          className={s.HelpButton}
          onClick={handleHelpClick}
        >
          <HelpOutline />
        </Collapsible.Trigger>
        {/* <RippleEffect /> */}
      </div>
      <Collapsible.Content component={null} contentClassName={s.SettingContent}>
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default memo(SettingsButton);
