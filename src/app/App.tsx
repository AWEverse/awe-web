import { FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "@/app/providers/theme-provider";
import InltLocaleProvider from "@/app/providers/intl-provider";
import { AWERoutesBrowserRouter } from "@/app/providers/router-provider";
import windowSize from "@/lib/utils/windowSize";
import { ThemeKey } from "@/shared/themes/config";
import "@/lib/core/public/templates/linq";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import useBodyClass from "@/shared/hooks/DOM/useBodyClass";
import { IS_TOUCH_ENV } from "@/lib/core";
import { usePageVisibility } from "@/lib/hooks/ui/usePageVisibility";

interface StateProps {
  themeKey?: ThemeKey;
}

const App: FC<StateProps> = ({ themeKey = "dark" }) => {
  const isPageVisible = usePageVisibility();

  useBodyClass("is-touch-env", IS_TOUCH_ENV);

  useComponentDidMount(() => {
    windowSize.update();
  });

  useBodyClass("page-visible", isPageVisible);

  return (
    <InltLocaleProvider>
      <ThemeProvider
        defaultMode={themeKey}
        theme={theme}
        disableTransitionOnChange
      >
        <CssBaseline />
        <BrowserRouter>
          <AWERoutesBrowserRouter />
        </BrowserRouter>

        {/* <DebugInfo /> */}
      </ThemeProvider>
    </InltLocaleProvider>
  );
};

export default App;
