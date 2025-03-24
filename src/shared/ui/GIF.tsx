import { FC, ReactNode } from "react";

interface OwnProps {
  readonly attachment: unknown;
  readonly size?: number;
  readonly tabIndex: number;

  onError(): void;
  showMediaNoLongerAvailableToast?: () => void;
  showVisualAttachment(): void;
  startDownload(): void;
  cancelDownload(): void;
}

const MAX_GIF_REPEAT = 4;
const MAX_GIF_TIME = 8;

type MediaEvent = React.SyntheticEvent<HTMLVideoElement, Event>;

const GIF: FC<OwnProps> = () => {
  return <div></div>;
};

export default GIF;
