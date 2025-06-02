import { useContext } from "react";
import { ScrollContext } from "../lib/contex";

const useScrollProvider = (disabled: boolean = false) => {

  const context = useContext(ScrollContext);

  if (!context) {

    if (disabled) {
      return {
        observeIntersectionForReading: undefined,
        observeIntersectionForLoading: undefined,
        observeIntersectionForPlaying: undefined
      };
    }

    throw Error("No ScrollContext provided!");
  }

  return context;
};

export default useScrollProvider;
