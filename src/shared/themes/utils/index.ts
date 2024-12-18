const getCurrentSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getCurrentTheme = () => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    return savedTheme;
  }

  return getCurrentSystemTheme();
};

const getCurrentSeason = () => {
  const date = new Date();
  const month = date.getMonth();

  switch (true) {
    case month >= 2 && month <= 5:
      return 'spring';
    case month >= 6 && month <= 8:
      return 'summer';
    case month >= 9 && month <= 11:
      return 'autumn';
    default:
      return 'winter';
  }
};

const getCurrentThemeAndSeason = () => {
  return {
    theme: getCurrentTheme(),
    season: getCurrentSeason(),
  };
};
