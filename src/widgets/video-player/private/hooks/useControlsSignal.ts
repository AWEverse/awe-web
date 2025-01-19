import { useRef } from "react";
import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";

const useControlsSignal = () => {
  const lockedRef = useRef(false);
  const [visibilitySignal, setVisibilitySignal] = useStateSignal(false);

  const setControlsVisible = useStableCallback((value: boolean) => {
    setVisibilitySignal(value);
  });

  const setIsLocked = useStableCallback((value: boolean) => {
    lockedRef.current = value;
  });

  return [visibilitySignal, setControlsVisible, setIsLocked] as const;
};

export default useControlsSignal;
