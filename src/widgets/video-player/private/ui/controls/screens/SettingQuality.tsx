import { FC, ReactNode } from "react";
import { SettingMainProps } from "./types";
import { ArrowBackRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { QUALITY_OPTIONS } from "../../../lib/constants";
import { withStateProps } from "@/lib/core";
import ActionButton from "@/shared/ui/ActionButton";
import MenuSeparator from "@/shared/ui/MenuSeparator";

interface OwnProps extends SettingMainProps {}

type QualitiesString = (typeof QUALITY_OPTIONS)[number];
type QualitiesPartialArray = QualitiesString[];

interface StateProps {
  quality?: QualitiesString;
  awiableQualities: QualitiesPartialArray;
}

const SettingQuality: FC<OwnProps & StateProps> = (props) => {
  const { onBackClick, quality, awiableQualities } = props;

  return (
    <div className="flex flex-col items-center space-y-2">
      {awiableQualities.map((quality) => (
        <ActionButton key={quality}>
          <span>{quality}</span>
        </ActionButton>
      ))}

      <MenuSeparator />

      <ActionButton
        onClick={onBackClick}
        icon={<ArrowBackRounded fontSize="small" />}
        label="Go back"
        size="md"
      />
    </div>
  );
};

const selectQualities = (): QualitiesPartialArray => [
  "1080p",
  "720p",
  "480p",
  "360p",
  "240p",
  "144p",
  "auto",
];

export default withStateProps(
  (): StateProps => {
    const qualities = selectQualities();

    return {
      quality: "1080p",
      awiableQualities: qualities,
    };
  },
  {
    memo: true,
  },
)(SettingQuality);
