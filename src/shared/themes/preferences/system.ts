import { SafeLocalStorage } from '@/lib/core';

const THEME = {
  DARK: 1,
  LIGHT: 2,
} as const;

const SEASON = {
  WINTER: 1,
  SPRING: 2,
  SUMMER: 3,
  AUTUMN: 4,
} as const;

type ThemeType = (typeof THEME)[keyof typeof THEME];
type SeasonType = (typeof SEASON)[keyof typeof SEASON];

/**
 * Set theme and season in localStorage.
 */
const setThemeAndSeasonInStorage = (): void => {
  const theme = getCurrentTheme();
  const season = getCurrentSeason();

  SafeLocalStorage.setMultipleItems({
    theme,
    season,
  });
};

/**
 * Get the current system theme based on user preferences.
 * @returns The system's theme (DARK or LIGHT).
 */
const getCurrentSystemTheme = (): ThemeType => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME.DARK : THEME.LIGHT;
};

/**
 * Get the current theme from localStorage or fallback to system theme.
 * @returns The theme (DARK or LIGHT).
 */
const getCurrentTheme = (): ThemeType => {
  const savedTheme = SafeLocalStorage.getItem<string>('theme');

  switch (savedTheme) {
    case '1':
      return THEME.DARK;
    case '2':
      return THEME.LIGHT;
    default:
      return getCurrentSystemTheme();
  }
};

/**
 * Get the current season based on the current month.
 * @returns The season (WINTER, SPRING, SUMMER, AUTUMN).
 */
const getCurrentSeason = (): SeasonType => {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 5) {
    return SEASON.SPRING;
  } else if (month >= 6 && month <= 8) {
    return SEASON.SUMMER;
  } else if (month >= 9 && month <= 11) {
    return SEASON.AUTUMN;
  }

  return SEASON.WINTER;
};

// Initialize the theme and season storage
setThemeAndSeasonInStorage();

export { getCurrentTheme, getCurrentSeason };
