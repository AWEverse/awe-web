import { useState } from 'react';
import useEffectOnce from '../effects/useEffectOnce';

const useBrowserOnline = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffectOnce(() => {
    const handleChange = () => setIsOnline(window.navigator.onLine);

    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);

    return () => {
      window.removeEventListener('offline', handleChange);
      window.removeEventListener('online', handleChange);
    };
  });

  return isOnline;
};

export default useBrowserOnline;
