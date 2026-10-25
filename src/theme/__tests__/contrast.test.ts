import { describe, expect, it } from 'vitest';
import { colors } from '../colors';

function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map((value) => parseInt(value, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
describe('shared text contrast', () => {
  it.each([colors.primary.default, colors.error, colors.success, colors.warning, colors.info, colors.neutral[400], colors.neutral[500], colors.neutral[600]])('%s has at least 4.5:1 against white', (color) => {
    expect(1.05 / (luminance(color) + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});
