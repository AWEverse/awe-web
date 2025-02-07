import { FC, memo, ReactNode } from "react";

import s from "./TopPannel.module.scss";
import SettingsDropdown from "../controls/SettingsDropdown";
import buildClassName from "@/shared/lib/buildClassName";
import { TriggerProps } from "@/shared/ui/dropdown";
import {
  ArrowDownward,
  ArrowDownwardRounded,
  SettingsRounded,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";

interface OwnProps {}

interface StateProps {}

const TriggerButton: FC<TriggerProps> = ({ onTrigger }) => (
  <IconButton
    onClick={onTrigger}
    className={buildClassName(s.control, s.blendMode)}
  >
    <SettingsRounded className={s.icon} />
  </IconButton>
);

const TopPannel: FC<OwnProps & StateProps> = () => {
  return (
    <div id="media-mobile-top-pannel" className={s.TopPannel}>
      <IconButton>
        <ArrowDownwardRounded />
      </IconButton>
      <SettingsDropdown triggerButton={TriggerButton} position="top-right" />
    </div>
  );
};

export default memo(TopPannel);
