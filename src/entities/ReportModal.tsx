import { ApiRestrictionReason } from "@/@types/api/types/chats";
import Modal, { ModalProps } from "@/shared/ui/Modal";
import { FC, Suspense, useCallback, useMemo } from "react";

import s from "./ReportModal.module.scss";
import { mergeArraysUnique } from "@/lib/utils/iteratees";
import ActionButton from "@/shared/ui/ActionButton";

const RESTRICT_REASONS: ApiRestrictionReason[] = [
  {
    text: "Report",
    reason: "report",
  },
  {
    text: "Spam",
    reason: "spam",
  },
  {
    text: "Nudity",
    reason: "nudity",
  },
  {
    text: "Violence",
    reason: "violence",
  },
  {
    text: "Hate speech",
    reason: "hate_speech",
  },
];

type OwnProps = {
  async?: boolean;
  reasons?: ApiRestrictionReason[];
  mergeReasons?: boolean;
  onSelect?: (reason: string) => void;
} & ModalProps;

interface StateProps {}

const ReportModal: FC<OwnProps & StateProps> = ({
  async,
  reasons,
  mergeReasons,
  onSelect,
  ...modalProps
}) => {
  const { onClose } = modalProps;

  const reasonsAll = useMemo(() => {
    if (!reasons) {
      return RESTRICT_REASONS;
    }

    if (mergeReasons) {
      return mergeArraysUnique(reasons, RESTRICT_REASONS);
    }

    return reasons;
  }, [mergeReasons, reasons]);

  const handleSelect = useCallback(
    (reason: string) => () => {
      onSelect?.(reason);
      onClose?.();
    },
    [onClose, onSelect],
  );

  const renderContent = () => {
    return (
      <div className={s.RestrictReason}>
        {reasonsAll.map(({ reason, text }, index) => (
          <ActionButton
            key={`${reason}_${index}`}
            date-reason-name={reason}
            className={s.reasonCard}
            onClick={handleSelect(reason)}
            aria-label={`Select reason: ${reason}`}
          >
            {text}
          </ActionButton>
        ))}
      </div>
    );
  };

  return (
    <Modal {...modalProps}>
      {async ? (
        <Suspense fallback={<div>Loading...</div>}>{renderContent()}</Suspense>
      ) : (
        renderContent()
      )}
    </Modal>
  );
};

export default ReportModal;
