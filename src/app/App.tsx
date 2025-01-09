import { FC, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from '@/app/providers/theme-provider';
import InltLocaleProvider from '@/app/providers/intl-provider';
import { AWERoutesBrowserRouter } from '@/app/providers/router-provider';
import { updateSizes } from '@/lib/utils/windowSize';
import { ThemeKey } from '@/shared/themes/config';
import useEffectOnce from '@/lib/hooks/effects/useEffectOnce';
import '@/lib/core/public/templates/linq';

interface StateProps {
  themeKey: ThemeKey;
}

const App: FC<StateProps> = ({ themeKey = 'dark' }) => {
  useEffectOnce(() => {
    updateSizes();
  });

  return (
    <StrictMode>
      <InltLocaleProvider>
        <ThemeProvider defaultMode={themeKey} theme={theme} disableTransitionOnChange>
          <CssBaseline />

          <BrowserRouter>
            <AWERoutesBrowserRouter />
          </BrowserRouter>
        </ThemeProvider>
      </InltLocaleProvider>
    </StrictMode>
  );
};

export default App;
