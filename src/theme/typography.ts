import { TextStyle } from 'react-native';

export const fonts = {
  inter: { regular: 'Inter-Regular', medium: 'Inter-Medium', semiBold: 'Inter-SemiBold', bold: 'Inter-Bold' },
  raleway: { bold: 'Raleway-Bold' },
} as const;

export const typography: Record<string, TextStyle> = {
  displayLg: { fontFamily: fonts.raleway.bold, fontSize: 32, lineHeight: 40 },
  displayMd: { fontFamily: fonts.raleway.bold, fontSize: 28, lineHeight: 36 },
  displaySm: { fontFamily: fonts.raleway.bold, fontSize: 24, lineHeight: 28 },
  titleLg: { fontFamily: fonts.inter.bold, fontSize: 24, lineHeight: 28 },
  titleSm: { fontFamily: fonts.inter.semiBold, fontSize: 18, lineHeight: 22 },
  bodyLg: { fontFamily: fonts.inter.regular, fontSize: 16, lineHeight: 20 },
  bodySm: { fontFamily: fonts.inter.regular, fontSize: 14, lineHeight: 20 },
  labelLg: { fontFamily: fonts.inter.semiBold, fontSize: 12, lineHeight: 16 },
  labelSm: { fontFamily: fonts.inter.medium, fontSize: 10, lineHeight: 14 },
} as const;

export type TextVariant = keyof typeof typography;
