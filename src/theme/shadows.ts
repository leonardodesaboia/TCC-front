import { Platform, ViewStyle } from 'react-native';

function createShadow(offsetY: number, blur: number, opacity: number, elevation: number): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${blur}px rgba(0, 0, 0, ${opacity})`,
    } as ViewStyle;
  }

  if (Platform.OS === 'android') {
    return { elevation };
  }

  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
  };
}

export const shadows: Record<string, ViewStyle> = {
  sm: createShadow(1, 3, 0.04, 1),
  md: createShadow(2, 8, 0.06, 3),
  lg: createShadow(4, 16, 0.08, 6),
};
