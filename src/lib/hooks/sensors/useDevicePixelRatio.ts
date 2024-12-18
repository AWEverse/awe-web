import { useState, useEffect } from 'react';
import { createCallbackManager } from '../../utils/callbacks';

const callbacks = createCallbackManager();

function createListener() {
  const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

  const changeHandler = () => {
    callbacks.runCallbacks();
    mediaQuery.removeEventListener('change', changeHandler); // Clean up
    createListener(); // Set up a new listener for the next change
  };

  mediaQuery.addEventListener('change', changeHandler, { once: true });
}

export default function useDevicePixelRatio() {
  const [dpr, setDpr] = useState(window.devicePixelRatio);

  useEffect(() => {
    const updateDpr = () => {
      setDpr(window.devicePixelRatio);
    };

    callbacks.addCallback(updateDpr);

    return () => {
      callbacks.removeCallback(updateDpr); // Clean up the callback on unmount
    };
  }, []);

  return dpr;
}

// Initialize the listener once
createListener();
