import { useContext } from "react";
import { ScrollContext } from "../lib/contex";

const useScrollProvider = () => {
  const context = useContext(ScrollContext);

  if (!context) {
    throw Error("No ScrollContext provided!");
  }

  return context;
};

export default useScrollProvider;
