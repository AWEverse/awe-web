import { useContext } from "react";
import ModalContext, { ModalContextType } from "../context";


export default function useModalContext(): ModalContextType {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error(
      "useModalContext must be used within a ModalContext Provider"
    );
  }

  return context;
}
