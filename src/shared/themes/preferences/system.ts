const THEME = {
  DARK: 1,
  LIGHT: 2,
};

const SEASON = {
  WINTER: 1,
  SPRING: 2,
  SUMMER: 3,
  AUTUMN: 4,
};

const setThemeAndSeasonInStorage = () => {
  const themeAndSeason = getCurrentThemeAndSeason();
  localStorage.setItem('theme', themeAndSeason.theme.toString());
  localStorage.setItem('season', themeAndSeason.season.toString());
};

const getCurrentSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME.DARK : THEME.LIGHT;
};

const getCurrentTheme = () => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    return Number(savedTheme);
  }

  return getCurrentSystemTheme();
};

const getCurrentSeason = () => {
  const date = new Date();
  const month = date.getMonth();

  switch (true) {
    case month >= 2 && month <= 5:
      return SEASON.SPRING;
    case month >= 6 && month <= 8:
      return SEASON.SUMMER;
    case month >= 9 && month <= 11:
      return SEASON.AUTUMN;
    default:
      return SEASON.WINTER;
  }
};

const getCurrentThemeAndSeason = () => {
  const theme = getCurrentTheme();
  const season = localStorage.getItem('season')
    ? Number(localStorage.getItem('season'))
    : getCurrentSeason();

  return {
    theme,
    season,
  };
};

setThemeAndSeasonInStorage();
