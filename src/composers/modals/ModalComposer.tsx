import React, { Suspense, useState, ReactNode } from "react";
import Modal from "@/shared/ui/Modal";
import modalRegistry, {
  ModalMap,
  ModalType,
  OpenModalFunction,
} from "./registered";
import ModalContext from "./utils/context";
import { useStableCallback } from "@/shared/hooks/base";

interface ModalComposerState {
  type: ModalType;
  props: ModalMap[ModalType];
  zIndex?: number;
}

const ModalRenderer = ({ modalState, modalRegistry, onClose }) => {
  if (!modalState?.type) return null;
  const ModalComponent = modalRegistry[modalState.type];
  return <ModalComponent {...modalState.props} onClose={onClose} />;
};

const ModalComposerProvider: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [modalState, setModalState] = useState<ModalComposerState | null>(null);

  const closeModal = useStableCallback(() => {
    setModalState(null);
  });

  const openModal: OpenModalFunction = useStableCallback(
    <T extends ModalType>(type: T, props: ModalMap[T], zIndex?: number) => {
      setModalState({
        type,
        props,
        zIndex,
      });
    },
  );

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <Modal isOpen={!!modalState} onClose={closeModal}>
        <Suspense fallback={<div>Loading modal...</div>}>
          {modalState?.type &&
            ((ModalComponent) => (
              <ModalComponent {...modalState.props} onClose={closeModal} />
            ))(modalRegistry[modalState.type])}
        </Suspense>
      </Modal>
    </ModalContext.Provider>
  );
};

export default ModalComposerProvider;
