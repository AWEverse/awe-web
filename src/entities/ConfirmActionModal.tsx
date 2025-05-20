import { FC, memo, ReactNode, useCallback, useRef } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import Modal, { ModalProps } from "@/shared/ui/Modal";
import { Button } from "@mui/material";

import s from "./ConfirmActionModal.module.scss";

type OwnProps = {
  action?: string;
  textParts?: ReactNode[];
  text?: string;
  confirmLabel?: string;
  confirmIsDestructive?: boolean;
  isConfirmDisabled?: boolean;
  isOnlyConfirm?: boolean;
  areButtonsInColumn?: boolean;
  onConfirm?: NoneToVoidFunction;
} & ModalProps;

const splitAndRenderText = (text: string) => {
  return text.split(/\n/).map((textPart, index) => (
    <p key={index} className="Text">
      {textPart}
    </p>
  ));
};

const ConfirmActionModal: FC<OwnProps> = ({
  isOpen,
  action,
  text,
  textParts,
  confirmLabel = "Confirm",
  confirmIsDestructive,
  isConfirmDisabled,
  isOnlyConfirm,
  areButtonsInColumn,
  className,
  children,
  backdropBlur,
  onConfirm,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectWithEnter = useCallback(
    (index: number) => {
      if (index === -1) onConfirm?.();
    },
    [onConfirm],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        handleSelectWithEnter(-1);
      }
    },
    [handleSelectWithEnter],
  );

  return (
    <Modal
      backdropBlur={backdropBlur}
      className={buildClassName("Confirm", s.ConfirmActionPopup, className)}
      isOpen={isOpen}
      onClose={onClose}
    >
      <h1 className={s.ConfirmPopupTitle}>{action}</h1>

      {text && <div className={s.Text}>{splitAndRenderText(text)}</div>}
      <div className={s.ConfirmPopupBody}>{textParts || children}</div>

      <div
        ref={containerRef}
        className={buildClassName(
          s.PopupButtons,
          areButtonsInColumn ? s.dialogButtonsColumn : s.dialogButtons,
        )}
        onKeyDown={handleKeyDown}
      >
        <Button
          className="Button"
          color={confirmIsDestructive ? "danger" : "success"}
          disabled={isConfirmDisabled}
          variant={confirmIsDestructive ? "soft" : "solid"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        {!isOnlyConfirm && (
          <Button
            className="Button"
            color="success"
            variant="plain"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default memo(ConfirmActionModal);
export type { OwnProps as ConfirmActionModalProps };
