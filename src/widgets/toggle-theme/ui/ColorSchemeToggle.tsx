import React from "react";
import { IconButton, Typography } from "@mui/material";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import { useTheme } from "@/shared/themes/ThemeContext";

interface ColorSchemeToggleProps {
  title?: string;
}

const ColorSchemeToggle: React.FC<ColorSchemeToggleProps> = ({ title }) => {
  const { mode, toggleTheme } = useTheme();

  return (
    <IconButton
      id="toggle-mode"
      onClick={toggleTheme}
      sx={(theme) => ({
        alignSelf: "center",
        zIndex: 10,
        px: 1,
        m: -1,
        color: theme.palette.text.primary,
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      })}
    >
      {mode === "light" ? <DarkModeRounded /> : <LightModeRounded />}
      {title && (
        <Typography variant="body2" sx={{ ml: 1 }}>
          {title}
        </Typography>
      )}
    </IconButton>
  );
};

export default ColorSchemeToggle;
