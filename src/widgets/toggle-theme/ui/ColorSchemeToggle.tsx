import { useColorScheme, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';

interface ColorSchemeToggleProps {
  title: string;
}

const ColorSchemeToggle: React.FC<ColorSchemeToggleProps> = ({ title }) => {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <IconButton color="primary" size="sm" variant="outlined" />;
  }

  return (
    <IconButton
      color="neutral"
      id="toggle-mode"
      size="sm"
      sx={{ alignSelf: 'center', zIndex: 10, px: 1, m: -1 }}
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
    >
      {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
      <Typography sx={{ ml: 0.5 }}>{title}</Typography>
    </IconButton>
  );
};

export default ColorSchemeToggle;
