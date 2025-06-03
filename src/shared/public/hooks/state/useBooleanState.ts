import { useState } from "react";
import useStableCallback from "../base/useStableCallback";

/**
 * Custom hook that returns a boolean flag and two functions to set or unset the flag.
 *
 * @param initial - The initial value of the flag. Defaults to false.
 * @returns An array containing the current value of the flag, a function to set the flag to true, and a function to set the flag to false.
 */
const useBooleanState = (
  initial: boolean = false,
): [boolean, () => void, () => void, () => void, () => void] => {
  const [value, setValue] = useState<boolean>(initial);

  const setTrue = useStableCallback(() => setValue(true));
  const setFalse = useStableCallback(() => setValue(false));
  const toggle = useStableCallback(() => setValue((prev) => !prev));
  const reset = useStableCallback(() => setValue(initial));

  return [value, setTrue, setFalse, toggle, reset];
};

export default useBooleanState;
