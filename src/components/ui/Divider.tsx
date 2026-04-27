import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';

interface DividerProps {
  spacing?: number;
}

export function Divider({ spacing: gap = 0 }: DividerProps) {
  return <View style={[styles.line, gap > 0 && { marginVertical: gap }]} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, backgroundColor: colors.neutral[200] },
});
