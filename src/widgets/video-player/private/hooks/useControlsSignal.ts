import { useRef } from "react";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";

const useControlsSignal = () => {
  const lockedRef = useRef(false);
  const [visibilitySignal, setVisibilitySignal] = useStateSignal(false);

  const setControlsVisible = useLastCallback((value: boolean) => {
    setVisibilitySignal(value);
  });

  const setIsLocked = useLastCallback((value: boolean) => {
    lockedRef.current = value;
  });

  return [visibilitySignal, setControlsVisible, setIsLocked] as const;
};

export default useControlsSignal;
