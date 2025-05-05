import { FC, useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "@/app/providers/theme-provider";
import { AWERoutesBrowserRouter } from "@/app/providers/router-provider";
import windowSize from "@/lib/utils/windowSize";
import { ThemeKey } from "@/shared/themes/config";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import { useBodyClasses } from "@/shared/hooks/DOM/useBodyClass";
import { IS_TOUCH_ENV } from "@/lib/core";
import { usePageVisibility } from "@/lib/hooks/ui/usePageVisibility";

import "@/lib/core/public/templates/linq";
import useGlobalDragEventPrevention from "./lib/hooks/useGlobalDragEventPrevention";
import ModalComposerProvider from "@/composers/modals/ModalComposer";
import { ALLOW_DRAG_CLASS_NAME, ALLOW_DRAG_DATA_ATTR } from "@/lib/config";

interface StateProps {
  themeKey?: ThemeKey;
}

export const useFPS = (): number => {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let id: number;

    const updateFPS = (time: number) => {
      frameCountRef.current++;
      const delta = time - lastTimeRef.current;

      if (delta >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      id = requestAnimationFrame(updateFPS);
    };

    id = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(id);
  }, []);

  return fps;
};

const FPS = () => {
  const fps = useFPS();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50dvw",
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.7)",
        color: fps > 55 ? "lime" : fps > 30 ? "yellow" : "red",
        padding: "4px 8px",
        borderRadius: 4,
        font: "14px monospace",
        pointerEvents: "none",
      }}
    >
      FPS: {fps}
    </div>
  );
};

const App: FC<StateProps> = ({ themeKey = "dark" }) => {
  const isPageVisible = usePageVisibility();

  useBodyClasses({
    "page-visible": isPageVisible,
    "is-touch-env": IS_TOUCH_ENV,
    "is-keyboard-active": windowSize.isKeyboardVisible,
  });

  useComponentDidMount(() => {
    windowSize.update();
  });

  useGlobalDragEventPrevention([ALLOW_DRAG_CLASS_NAME, ALLOW_DRAG_DATA_ATTR]);

  return (
    <ThemeProvider
      defaultMode={themeKey}
      theme={theme}
      disableTransitionOnChange
    >
      <CssBaseline enableColorScheme />

      <ModalComposerProvider>
        <AWERoutesBrowserRouter />
      </ModalComposerProvider>
      <FPS />
    </ThemeProvider>
  );
};

export default App;
