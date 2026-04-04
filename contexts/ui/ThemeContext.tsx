import { createContext, useContext, type PropsWithChildren } from 'react';

import { appTheme, getNavigationTheme } from '../../App/theme/theme';

type ThemeContextValue = {
  colors: typeof appTheme;
  navigationTheme: ReturnType<typeof getNavigationTheme>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const value: ThemeContextValue = {
    colors: appTheme,
    navigationTheme: getNavigationTheme(),
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
