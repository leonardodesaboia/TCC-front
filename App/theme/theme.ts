import { DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';

import { brandPalette } from './colors';

export const appTheme = {
  ...brandPalette,
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF4EA',
  text: brandPalette.black1,
  subtitle: brandPalette.brown2,
  border: brandPalette.gray2,
};

export function getNavigationTheme(): NavigationTheme {
  return {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: appTheme.orange2,
      background: appTheme.background,
      card: appTheme.surface,
      text: appTheme.text,
      border: appTheme.border,
      notification: appTheme.orange3,
    },
  };
}
