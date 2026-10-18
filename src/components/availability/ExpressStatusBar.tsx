import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { useExpressAvailability } from '@/lib/availability/useExpressAvailability';
import type { ExpressAvailabilityStatus } from '@/lib/availability/types';
import { colors, spacing } from '@/theme';

const PROBLEM_STATES = new Set<ExpressAvailabilityStatus>(['permission-denied', 'stale', 'unavailable']);

const messageMap: Record<Extract<ExpressAvailabilityStatus, 'permission-denied' | 'stale' | 'unavailable'>, string> = {
  'permission-denied': 'A permissão de localização foi retirada. Toque para resolver.',
  stale: 'Sua localização não é atualizada há alguns minutos. Toque para atualizar.',
  unavailable: 'Não foi possível obter sua localização. Toque para resolver.',
};

export function ExpressStatusBar() {
  const router = useRouter();
  const { geoActive, status } = useExpressAvailability();

  if (!geoActive || !PROBLEM_STATES.has(status)) return null;

  return (
    <Pressable style={styles.bar} onPress={() => router.push('/(professional)/(profile)' as never)}>
      <View style={styles.row}>
        <AlertTriangle color={colors.warning} size={14} />
        <Text variant="labelSm" color={colors.neutral[900]}>
          {messageMap[status as keyof typeof messageMap]}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
