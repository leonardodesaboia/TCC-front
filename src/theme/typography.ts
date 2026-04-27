import { TextStyle } from 'react-native';

export const fonts = {
  inter: { regular: 'Inter-Regular', medium: 'Inter-Medium', semiBold: 'Inter-SemiBold', bold: 'Inter-Bold' },
  raleway: { bold: 'Raleway-Bold' },
} as const;

export const typography: Record<string, TextStyle> = {
  displayLg: { fontFamily: fonts.inter.bold, fontSize: 30, lineHeight: 38 },
  displayMd: { fontFamily: fonts.inter.bold, fontSize: 26, lineHeight: 32 },
  displaySm: { fontFamily: fonts.inter.bold, fontSize: 22, lineHeight: 28 },
  titleLg: { fontFamily: fonts.inter.semiBold, fontSize: 20, lineHeight: 26 },
  titleMd: { fontFamily: fonts.inter.semiBold, fontSize: 17, lineHeight: 22 },
  titleSm: { fontFamily: fonts.inter.semiBold, fontSize: 15, lineHeight: 20 },
  bodyLg: { fontFamily: fonts.inter.regular, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: fonts.inter.regular, fontSize: 14, lineHeight: 20 },
  labelLg: { fontFamily: fonts.inter.medium, fontSize: 13, lineHeight: 16 },
  labelSm: { fontFamily: fonts.inter.medium, fontSize: 11, lineHeight: 14 },
} as const;

export type TextVariant = keyof typeof typography;
