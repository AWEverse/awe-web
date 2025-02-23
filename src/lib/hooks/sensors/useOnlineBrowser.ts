import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import { useState } from "react";

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
