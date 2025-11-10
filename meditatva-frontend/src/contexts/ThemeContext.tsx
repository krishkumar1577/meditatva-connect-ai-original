import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "medical-glass";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("meditatva-theme");
    return (stored as ThemeMode) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "medical-glass");
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem("meditatva-theme", theme);
    
    // Apply theme-specific CSS variables
    if (theme === "light") {
      root.style.setProperty("--bg-primary", "249 250 251");
      root.style.setProperty("--bg-secondary", "255 255 255");
      root.style.setProperty("--text-primary", "17 24 39");
      root.style.setProperty("--text-secondary", "107 114 128");
      root.style.setProperty("--border-color", "229 231 235");
      root.style.setProperty("--accent-primary", "59 130 246");
      root.style.setProperty("--accent-secondary", "99 102 241");
    } else if (theme === "dark") {
      root.style.setProperty("--bg-primary", "17 24 39");
      root.style.setProperty("--bg-secondary", "31 41 55");
      root.style.setProperty("--text-primary", "243 244 246");
      root.style.setProperty("--text-secondary", "156 163 175");
      root.style.setProperty("--border-color", "55 65 81");
      root.style.setProperty("--accent-primary", "96 165 250");
      root.style.setProperty("--accent-secondary", "129 140 248");
    } else if (theme === "medical-glass") {
      root.style.setProperty("--bg-primary", "240 249 255");
      root.style.setProperty("--bg-secondary", "255 255 255");
      root.style.setProperty("--text-primary", "12 74 110");
      root.style.setProperty("--text-secondary", "71 85 105");
      root.style.setProperty("--border-color", "186 230 253");
      root.style.setProperty("--accent-primary", "14 165 233");
      root.style.setProperty("--accent-secondary", "6 182 212");
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "medical-glass";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
