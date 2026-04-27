import { StyleSheet, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Algo deu errado. Tente novamente.', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <AlertTriangle color={colors.error} size={32} />
      </View>
      <Text variant="titleSm" style={styles.centered}>Ops!</Text>
      <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>{message}</Text>
      {onRetry ? (
        <Button variant="secondary" size="sm" onPress={onRetry} fullWidth={false}>
          Tentar novamente
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginBottom: spacing[2],
  },
  centered: { textAlign: 'center' },
});
