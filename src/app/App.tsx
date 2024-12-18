import { FC, StrictMode, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from '@/app/providers/theme-provider';
import InltLocaleProvider from '@/app/providers/intl-provider';
import { AWERoutesBrowserRouter } from '@/app/providers/router-provider';
import '@/lib/core/public/templates/linq';
import { createFPSCounter } from '@/lib/utils/OS/windowEnviroment';
import useEffectOnce from '@/lib/hooks/effects/useEffectOnce';
import { updateSizes } from '@/lib/utils/windowSize';
import { ThemeKey } from '@/shared/themes/config';

interface StateProps {
  themeKey: ThemeKey;
}

const App: FC<StateProps> = ({ themeKey = 'dark' }) => {
  useEffectOnce(() => {
    updateSizes();

    const fpsCounter = createFPSCounter();
    fpsCounter.start();

    return () => {
      fpsCounter.stop();
    };
  });

  return (
    <StrictMode>
      <InltLocaleProvider>
        <ThemeProvider defaultMode={themeKey} theme={theme}>
          <CssBaseline />

          <BrowserRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
            <AWERoutesBrowserRouter />
          </BrowserRouter>
        </ThemeProvider>
      </InltLocaleProvider>
    </StrictMode>
  );
};

export default App;
