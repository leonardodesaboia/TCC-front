import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { useExpressAvailability } from '@/lib/availability/useExpressAvailability';
import { useNow } from '@/lib/hooks/useNow';
import { formatTimeAgo } from '@/lib/utils/formatters';
import type { ExpressAvailabilityStatus } from '@/lib/availability/types';
import { colors, radius, spacing } from '@/theme';

interface ExpressAvailabilityCardProps {
  variant?: 'default' | 'compact';
}

interface BadgeStyle {
  backgroundColor: string;
  foregroundColor: string;
  label: string;
}

interface CompactCardTone {
  borderColor: string;
  backgroundColor: string;
}

function badgeFor(status: ExpressAvailabilityStatus): BadgeStyle {
  switch (status) {
    case 'idle':
      return { backgroundColor: colors.neutral[100], foregroundColor: colors.neutral[600], label: 'Desligado' };
    case 'requesting-permission':
      return { backgroundColor: colors.neutral[100], foregroundColor: colors.neutral[600], label: 'Aguardando...' };
    case 'permission-denied':
      return { backgroundColor: '#FEE2E2', foregroundColor: colors.error, label: 'Sem permissão' };
    case 'capturing':
      return { backgroundColor: colors.neutral[100], foregroundColor: colors.neutral[600], label: 'Localizando...' };
    case 'active':
      return { backgroundColor: '#DCFCE7', foregroundColor: '#15803D', label: 'Ativo' };
    case 'stale':
      return { backgroundColor: '#FEF3C7', foregroundColor: '#B45309', label: 'Atualizando...' };
    case 'unavailable':
      return { backgroundColor: '#FEE2E2', foregroundColor: colors.error, label: 'Indisponível' };
  }
}

function compactToneFor(status: ExpressAvailabilityStatus): CompactCardTone {
  switch (status) {
    case 'active':
      return { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' };
    case 'permission-denied':
    case 'unavailable':
      return { borderColor: '#FECACA', backgroundColor: '#FEF2F2' };
    default:
      return { borderColor: colors.neutral[200], backgroundColor: colors.neutral[50] };
  }
}

function messageFor(status: ExpressAvailabilityStatus, lastCapturedAt: Date | null, now: number): string {
  switch (status) {
    case 'idle':
      return 'Ative para receber pedidos de clientes a até 5 km de você.';
    case 'requesting-permission':
      return 'Solicitando permissão de localização...';
    case 'permission-denied':
      return 'O app precisa da sua localização para saber quais pedidos estão perto de você. '
        + 'Libere a localização para o AllSet nas configurações do celular e toque em "Tentar de novo".';
    case 'capturing':
      return 'Localizando você...';
    case 'active': {
      if (!lastCapturedAt) return 'Você está recebendo pedidos de clientes a até 5 km.';
      const secondsAgo = Math.max(0, (now - lastCapturedAt.getTime()) / 1000);
      return `Você está recebendo pedidos de clientes a até 5 km. Localização atualizada ${formatTimeAgo(secondsAgo)}.`;
    }
    case 'stale':
      return 'Sua localização não é atualizada há alguns minutos. Tentando de novo...';
    case 'unavailable':
      return 'Não foi possível obter sua localização. Verifique se o GPS está ligado e tente de novo.';
  }
}

/** Mensagem curta exibida no card compacto (painel) quando há algo a resolver. */
function compactProblemFor(status: ExpressAvailabilityStatus): string | null {
  switch (status) {
    case 'permission-denied':
      return 'Libere a localização nas configurações do celular para receber pedidos.';
    case 'unavailable':
      return 'Não conseguimos sua localização. Verifique o GPS.';
    default:
      return null;
  }
}

export function ExpressAvailabilityCard({ variant = 'default' }: ExpressAvailabilityCardProps) {
  const { status, geoActive, lastCapturedAt, toggle, forceCapture, openSettings } = useExpressAvailability();
  // Re-renderiza a cada 30 s para o "atualizada há X min" não ficar congelado.
  const now = useNow(30000, status === 'active');
  const badge = badgeFor(status);
  const compactTone = compactToneFor(status);
  const busy = status === 'requesting-permission' || status === 'capturing';

  if (variant === 'compact') {
    return (
      <View
        style={[
          styles.compactCard,
          {
            borderColor: compactTone.borderColor,
            backgroundColor: compactTone.backgroundColor,
          },
        ]}
      >
        <View style={styles.compactLeft}>
          <Zap color={colors.primary.default} size={16} />
          <Text variant="bodySm">Express</Text>
          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text variant="labelSm" color={badge.foregroundColor}>
              {badge.label}
            </Text>
          </View>
        </View>

        <Switch
          value={geoActive}
          onValueChange={toggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: geoActive, busy }}
          accessibilityLabel={`Express ${geoActive ? 'ativo' : 'desligado'}`}
          trackColor={{ false: colors.neutral[300], true: colors.success }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.neutral[300]}
        />
        {compactProblemFor(status) ? (
          <View style={styles.compactProblem}>
            <Text variant="labelLg" color={colors.neutral[700]}>{compactProblemFor(status)}</Text>
            <Pressable onPress={() => void toggle(true)} hitSlop={6}>
              <Text variant="labelLg" color={colors.primary.default}>Tentar de novo</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Zap color={colors.primary.default} size={20} />
          <Text variant="titleSm">Disponível para Express</Text>
        </View>

        <Switch
          value={geoActive}
          onValueChange={toggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: geoActive, busy }}
          trackColor={{ false: colors.neutral[300], true: colors.success }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.neutral[300]}
        />
      </View>

      <View
        style={[styles.badge, styles.defaultBadge, { backgroundColor: badge.backgroundColor }]}
        accessibilityLabel={badge.label}
      >
        {busy ? <ActivityIndicator size="small" color={badge.foregroundColor} /> : null}
        <Text variant="labelSm" color={badge.foregroundColor}>
          {badge.label}
        </Text>
      </View>

      <Text variant="bodySm" color={colors.neutral[600]}>
        {messageFor(status, lastCapturedAt, now)}
      </Text>

      {status === 'permission-denied' ? (
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={() => void openSettings()}>
            <Text variant="labelLg" color={colors.primary.default}>
              Abrir configurações
            </Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => void toggle(true)}>
            <Text variant="labelLg" color={colors.primary.default}>
              Tentar de novo
            </Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'stale' || status === 'unavailable' ? (
        <Pressable style={styles.actionButton} onPress={() => void forceCapture()}>
          <Text variant="labelLg" color={colors.primary.default}>
            {status === 'stale' ? 'Atualizar agora' : 'Tentar de novo'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  compactCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    borderRadius: radius.full,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  defaultBadge: {
    alignSelf: 'flex-start',
  },
  compactProblem: {
    width: '100%',
    gap: spacing[1],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[1],
  },
});
