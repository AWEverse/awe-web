import React, { Suspense, useState, ReactNode } from "react";
import Modal from "@/shared/ui/Modal";
import modalRegistry, {
  ModalMap,
  ModalType,
  OpenModalFunction,
} from "./registered";
import ModalContext from "./utils/context";
import { useStableCallback } from "@/shared/hooks/base";

import "./ModalComposer.css";

interface ModalComposerState {
  type: ModalType;
  props: ModalMap[ModalType];
  zIndex?: number;
}

const ModalComposerProvider: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [modalState, setModalState] = useState<ModalComposerState | null>(null);

  const closeModal = useStableCallback(() => {
    setModalState(null);
  });

  const openModal: OpenModalFunction = useStableCallback(
    <T extends ModalType>(
      type: T,
      props: Omit<ModalMap[T], "onClose">,
      zIndex?: number,
    ) => {
      setModalState({
        type,
        props: props as ModalMap[T],
        zIndex,
      });
    },
  );

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <Modal
        className="ModalGlobalContainer"
        isOpen={Boolean(modalState)}
        onClose={closeModal}
      >
        <h2 id="modal-global-id" className="ModalGlobalTitle">
          {modalState?.type.replace("-", " ")}
        </h2>

        <Suspense fallback={<div>Loading modal...</div>}>
          {modalState?.type &&
            ((ModalComponent) => (
              <ModalComponent
                {...(modalState.props as any)}
                onClose={closeModal}
              />
            ))(modalRegistry[modalState.type])}
        </Suspense>
      </Modal>
    </ModalContext.Provider>
  );
};

export default ModalComposerProvider;
