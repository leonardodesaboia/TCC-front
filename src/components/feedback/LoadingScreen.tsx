import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary.default} />
      <Text variant="bodySm" color={colors.neutral[500]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[6], backgroundColor: colors.background },
});
