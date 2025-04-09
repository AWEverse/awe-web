import React, { Suspense, useState, ReactNode } from "react";
import Modal from "@/shared/ui/Modal";
import modalRegistry, { ModalMap, ModalType } from "../../registry";
import ModalContext from "../../utils/context";
import { useStableCallback } from "@/shared/hooks/base";

const ModalComposerProvider: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [modalState, setModalState] = useState<{
    type: ModalType;
    props: ModalMap;
    zIndex?: number;
  } | null>(null);

  const closeModal = useStableCallback(() => {
    setModalState(null);
  });

  const openModal = useStableCallback(
    (type: ModalType, props: ModalMap, zIndex?: number) => {
      setModalState({
        type,
        props: { ...props, onClose: closeModal },
        zIndex,
      });
    },
  );

  const ModalComponent = modalState?.type
    ? modalRegistry[modalState.type]
    : null;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <Modal isOpen={!!modalState} onClose={closeModal}>
        <Suspense fallback={<div>Loading modal...</div>}>
          {ModalComponent && modalState && (
            <ModalComponent {...modalState.props} />
          )}
        </Suspense>
      </Modal>
    </ModalContext.Provider>
  );
};

export default ModalComposerProvider;
