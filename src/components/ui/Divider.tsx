import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

interface DividerProps {
  vertical?: number;
}

export function Divider({ vertical = spacing[3] }: DividerProps) {
  return <View style={[styles.line, { marginVertical: vertical }]} />;
}

const styles = StyleSheet.create({
  line: { height: 1, backgroundColor: colors.neutral[300] },
});
