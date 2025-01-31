import { useState } from "react";
import { createCallbackManager } from "../../utils/callbacks";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";

const callbacks = createCallbackManager();
let dpr = window.devicePixelRatio;

function createListener() {
  const mediaQuery = window.matchMedia(`(resolution: ${dpr}dppx)`);

  const handler = () => {
    dpr = window.devicePixelRatio;
    callbacks.runCallbacks();
    mediaQuery.removeEventListener("change", handler);
    createListener();
  };

  mediaQuery.addEventListener("change", handler, { once: true });
}

createListener();

export default function useDevicePixelRatio() {
  const [_, forceUpdate] = useState(0);

  useComponentDidMount(() => {
    const update = () => forceUpdate((v) => v + 1);
    const release = callbacks.addCallback(update);
    return release;
  });

  return dpr;
}

export const getDevicePixelRatio = () => dpr;
