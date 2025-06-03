import React, { createContext, useContext, useEffect, useState } from "react";
import { SafeLocalStorage } from "@/lib/core";

export type ThemeMode = "light" | "dark";
export type Season = "winter" | "spring" | "summer" | "autumn";

interface ThemeContextType {
  mode: ThemeMode;
  season: Season;
  toggleTheme: () => void;
  setSeason: (season: Season) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = SafeLocalStorage.getItem("theme");
    if (stored) return stored as ThemeMode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [season, setSeason] = useState<Season>(() => {
    const stored = SafeLocalStorage.getItem("season");
    return (stored as Season) || "winter";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-season", season);
    SafeLocalStorage.setItem("theme", mode);
    SafeLocalStorage.setItem("season", season);
  }, [mode, season]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ mode, season, toggleTheme, setSeason }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
