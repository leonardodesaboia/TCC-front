import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';

import { brandPalette } from './colors';

export type ThemeMode = 'light' | 'dark';

const lightTheme = {
  ...brandPalette,
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF4EA',
  text: brandPalette.black1,
  subtitle: brandPalette.brown2,
  border: brandPalette.gray2,
};

const darkTheme = {
  ...brandPalette,
  background: '#1B130E',
  surface: '#241A14',
  surfaceAlt: '#2E211A',
  text: '#FFF7F0',
  subtitle: brandPalette.orange1,
  border: brandPalette.brown1,
};

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

export function getNavigationTheme(mode: ThemeMode): NavigationTheme {
  const theme = appThemes[mode];
  const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.orange2,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.orange3,
    },
  };
}
