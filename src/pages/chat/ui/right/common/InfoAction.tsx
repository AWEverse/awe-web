import { FC, memo, ReactNode, useState } from "react";
import s from "./InfoAction.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";
import { Snackbar, SnackbarCloseReason, Alert } from "@mui/material";

interface OwnProps {
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  alert?: ReactNode;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
}

const InfoAction: FC<OwnProps> = ({
  className,
  title = "title",
  subtitle = "subtitle",
  alert = "Copied to clipboard!",
  startDecorator,
  endDecorator,
}) => {
  const [open, setOpen] = useState(false);

  const handleCopyClick = useStableCallback(() => {
    setOpen(true);
  });

  const handleClose = useStableCallback(
    (_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
      if (reason === "clickaway") {
        return;
      }

      setOpen(false);
    },
  );

  return (
    <>
      <div
        aria-label="Copy title"
        className={buildClassName(s.ActionWrapper, className)}
        role="button"
        onClick={handleCopyClick}
      >
        {startDecorator && (
          <span className={s.Decorator}>{startDecorator}</span>
        )}
        <div className={s.Container}>
          <h3 className={s.Title}>{title}</h3>
          <span className={s.Subtitle}>{subtitle}</span>
        </div>
        {endDecorator && <span className={s.Decorator}>{endDecorator}</span>}
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={1000}
        message="Note archived"
        open={open}
        onClose={handleClose}
      >
        <Alert sx={{ width: "100%" }} onClose={handleClose}>
          {alert}
        </Alert>
      </Snackbar>
    </>
  );
};

export default memo(InfoAction);
