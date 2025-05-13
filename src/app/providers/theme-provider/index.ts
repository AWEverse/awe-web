import { createTheme } from '@mui/material/styles';
import { DarkPalette, LightPalette } from '@/shared/themes/palettes/spring';

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
      palette: LightPalette,
    },
    dark: {
      palette: DarkPalette,
    },
  },
});

export default theme;
