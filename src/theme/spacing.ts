export const spacing = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 } as const;

export const layout = {
  screenPaddingHorizontal: spacing[4], screenPaddingVertical: spacing[4],
  cardPadding: spacing[4], sectionGap: spacing[6], formGap: spacing[4],
  itemGap: spacing[3], bottomTabHeight: 64, bottomTabSafeOffset: 80, headerHeight: 56,
} as const;
