interface ModalRef {
  onClose: () => void;
  setIsVisible: (isVisible: boolean) => void;
}

type ModalEntry = [string, ModalRef];

const modals: ModalEntry[] = [];

const UNDEFINED_INDEX = -1;

export const getModals = (): Readonly<ModalEntry>[] => {
  return modals;
};

export const registerModal = (UUID: string, modal: ModalRef) => {
  const index = modals.findIndex(([id]) => id === UUID);

  if (index === UNDEFINED_INDEX) {
    modals.push([UUID, modal]);
  } else {
    modals[index] = [UUID, modal];
  }
};

export const unregisterModal = (UUID: string) => {
  const index = modals.findIndex(([id]) => id === UUID);

  if (index !== UNDEFINED_INDEX) {
    modals.splice(index, 1);
  }
};

export const bringModalToFront = (UUID: string) => {
  const index = modals.findIndex(([id]) => id === UUID);

  if (index !== UNDEFINED_INDEX) {
    const modal = modals.splice(index, 1)[0];
    modals.push(modal);
  }
};

export const unregisterAllModals = () => {
  modals.length = 0;
};

export const closeTopModal = () => {
  const topModal = modals[modals.length - 1];

  if (topModal) {
    const [topUUID, modalRef] = topModal;
    modalRef.onClose();
    unregisterModal(topUUID);
  }
};
