import { createContext } from "react";
import { OpenModalFunction } from "../registered";

interface ModalContextType {
  openModal: OpenModalFunction;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export default ModalContext;
export type { ModalContextType };
