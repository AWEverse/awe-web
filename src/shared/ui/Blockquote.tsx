import { ApiMessageEntityTypes } from "@/@types/api/types/messages";
import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";
import { ReactNode, useRef } from "react";
import useCollapsibleLines from "../hooks/DOM/useCollapsible";
import buildClassName from "../lib/buildClassName";
import s from "./Blockquote.module.scss";
import { ArrowDownwardRounded, ArrowUpwardRounded } from "@mui/icons-material";

type OwnProps = {
  canBeCollapsible?: boolean;
  isToggleDisabled?: boolean;
  children: ReactNode;
};

const MAX_LINES = 4;

const Blockquote = ({
  canBeCollapsible,
  isToggleDisabled,
  children,
}: OwnProps) => {
  // eslint-disable-next-line no-null/no-null
  const ref = useRef<HTMLQuoteElement | null>(null);
  const { isCollapsed, isCollapsible, setIsCollapsed } = useCollapsibleLines(
    ref,
    MAX_LINES,
    undefined,
    !canBeCollapsible,
  );

  const canExpand = !isToggleDisabled && isCollapsed;

  const handleExpand = useStableCallback(() => {
    setIsCollapsed(false);
  });

  const handleToggle = useStableCallback(() => {
    setIsCollapsed((prev) => !prev);
  });

  return (
    <span className={s.root} onClick={canExpand ? handleExpand : undefined}>
      <blockquote
        ref={ref}
        data-entity-type={ApiMessageEntityTypes.Blockquote}
        className={buildClassName(s.blockquote, isCollapsed && s.expanded)}
      >
        <div
          className={buildClassName(
            s.gradientContainer,
            isCollapsed && s.collapsed,
          )}
        >
          {children}
        </div>
        {isCollapsible && (
          <div
            className={buildClassName(
              s.collapseIcon,
              !isToggleDisabled && s.clickable,
            )}
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
