import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { appThemes, getNavigationTheme, type ThemeMode } from '../../App/theme/theme';

type ThemeContextValue = {
  theme: ThemeMode;
  colors: (typeof appThemes)[ThemeMode];
  navigationTheme: ReturnType<typeof getNavigationTheme>;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  const value: ThemeContextValue = {
    theme,
    colors: appThemes[theme],
    navigationTheme: getNavigationTheme(theme),
    toggleTheme: () => {
      setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }

  return context;
}
