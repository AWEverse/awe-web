import { useState } from "react";
import useComponentDidMount from "../effects/useComponentDidMount";

const useBrowserOnline = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useComponentDidMount(() => {
    const handleChange = () => setIsOnline(window.navigator.onLine);

    window.addEventListener("online", handleChange);
    window.addEventListener("offline", handleChange);

    return () => {
      window.removeEventListener("offline", handleChange);
      window.removeEventListener("online", handleChange);
    };
  });

  return isOnline;
};

export default useBrowserOnline;
