import buildClassName from "@/shared/lib/buildClassName";
import { FC } from "react";
import HeaderNavigation from "../../common/HeaderNavigation";
import { useStableCallback } from "@/shared/hooks/base";
import { useLeftScreenNavigation } from "../lib/ScreenContext";

import s from "./ArchivedScreen.module.scss";

interface OwnProps {
  className?: string;
}

interface StateProps {}

const ArchivedScreen: FC<OwnProps & StateProps> = (props) => {
  const { className } = props;

  const { goBack } = useLeftScreenNavigation();

  const handleSearchClose = useStableCallback(() => {
    goBack();
  });

  return (
    <div className={buildClassName(className)}>
      <HeaderNavigation onPrevClick={handleSearchClose}>
        Achive
      </HeaderNavigation>

      <div className={s.container}>
        <div className={s.header}>
          <span>BENTO BOY</span>
          <span>Max 20</span>
        </div>
        <div className={s.blocksSection}>
          <div className={`${s.blockCount} ${s.option}`}>16</div>
          <input
            type="range"
            min="0"
            max="20"
            value="16"
            className={s.slider}
          />
        </div>
        <div className={s.options}>
          <div className={s.option}>[ ]</div>
          <div className={s.option}>16:9</div>
          <div className={s.option}>5:7</div>
          <div className={s.option}>1:1</div>
          <div className={s.option}>Free</div>
        </div>
        <div className={s.options}>
          <div className={s.option}>Rows 3</div>
          <div className={s.toggle}>
            <span>Captions</span>
            <span>ON</span>
          </div>
        </div>
        <div className={s.options}>
          <div className={s.option}>Radius 00</div>
          <div className={s.option}>Padding 8</div>
          <div className={s.option}>Color ☾</div>
        </div>
        <div className={s.toggle}>
          <span>DARK MODE</span>
          <span>☾</span>
        </div>
        <div className={s.button}>GENERATE ↻</div>
      </div>
    </div>
  );
};

export default ArchivedScreen;
