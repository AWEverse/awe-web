import { createContext } from "react";
import { ModalType, ModalMap } from "../registry";

interface ModalContextType {
  openModal: (
    type: ModalType,
    props: ModalMap,
    zIndex?: number,
  ) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export default ModalContext;
export type { ModalContextType };
