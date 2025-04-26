import { FC } from "react";
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

interface StateProps {
  themeKey?: ThemeKey;
}

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

  return (
    <ThemeProvider defaultMode={themeKey} theme={theme}>
      <CssBaseline />

      <ModalComposerProvider>
        <AWERoutesBrowserRouter />
      </ModalComposerProvider>
    </ThemeProvider>
  );
};

export default App;
