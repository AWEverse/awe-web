import { createTheme } from '@mui/material/styles';
import { DarkPallete, LightPallete } from '@/shared/themes/hallowen';

// Extending MUI's theme types to support custom color properties
declare module '@mui/material/styles' {
  interface TypeBackground {
    level1?: string;
    level2?: string;
    level3?: string;
    surface?: string;
  }
}

const theme = createTheme({
  cssVariables: { cssVarPrefix: 'awe', colorSchemeSelector: '.mode-%s' },
  colorSchemes: {
    light: {
      palette: LightPallete,
    },
    dark: {
      palette: DarkPallete,
    },
  },
});

export default theme;
