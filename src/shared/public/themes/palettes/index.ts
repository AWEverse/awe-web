import { ThemeMode, Season } from '@/shared/themes/ThemeContext';
import * as Spring from './spring';
import * as Summer from './summer';
import * as Autumn from './autumn';
import * as Winter from './winterfall';

export type Palette = {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
    soft: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  accent: {
    main: string;
    light: string;
    dark: string;
  };
  error: {
    main: string;
    light: string;
    dark: string;
  };
  warning: {
    main: string;
    light: string;
    dark: string;
  };
  success: {
    main: string;
    light: string;
    dark: string;
  };
};

export const getPalette = (mode: ThemeMode, season: Season): Palette => {
  const palettes = {
    spring: mode === 'light' ? Spring.LightPalette : Spring.DarkPalette,
    summer: mode === 'light' ? Summer.LightPalette : Summer.DarkPalette,
    autumn: mode === 'light' ? Autumn.LightPalette : Autumn.DarkPalette,
    winter: mode === 'light' ? Winter.LightPalette : Winter.DarkPalette,
  };

  return palettes[season] as Palette;
};
