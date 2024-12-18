import { useState } from 'react';
import useLastCallback from '../events/useLastCallback';

/**
 * Custom hook that returns a boolean flag and two functions to set or unset the flag.
 *
 * @param initial - The initial value of the flag. Defaults to false.
 * @returns An array containing the current value of the flag, a function to set the flag to true, and a function to set the flag to false.
 */
const useFlag = (initial: boolean = false): [boolean, () => void, () => void] => {
  const [value, setValue] = useState<boolean>(initial);

  const setTrue = useLastCallback(() => setValue(true));
  const setFalse = useLastCallback(() => setValue(false));

  return [value, setTrue, setFalse];
};

export default useFlag;
