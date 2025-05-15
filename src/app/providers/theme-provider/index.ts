import { createTheme } from '@mui/material/styles';
import { DarkPalette, LightPalette } from '@/shared/themes/palettes/hallowen';

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
