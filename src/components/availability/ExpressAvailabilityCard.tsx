import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { useExpressAvailability } from '@/lib/availability/useExpressAvailability';
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

function badgeFor(status: ExpressAvailabilityStatus): BadgeStyle {
  switch (status) {
    case 'idle':
      return { backgroundColor: colors.neutral[100], foregroundColor: colors.neutral[600], label: 'Desligado' };
    case 'requesting-permission':
      return { backgroundColor: colors.neutral[100], foregroundColor: colors.neutral[600], label: 'Aguardando...' };
    case 'permission-denied':
      return { backgroundColor: '#FEE2E2', foregroundColor: colors.error, label: 'Sem permissao' };
    case 'capturing':
      return { backgroundColor: colors.neutral[100], foregroundColor: colors.neutral[600], label: 'Localizando...' };
    case 'active':
      return { backgroundColor: '#DCFCE7', foregroundColor: '#15803D', label: 'Ativo' };
    case 'stale':
      return { backgroundColor: '#FEF3C7', foregroundColor: '#B45309', label: 'Atualizando...' };
    case 'unavailable':
      return { backgroundColor: '#FEE2E2', foregroundColor: colors.error, label: 'Indisponivel' };
  }
}

function messageFor(status: ExpressAvailabilityStatus, lastCapturedAt: Date | null): string {
  switch (status) {
    case 'idle':
      return 'Ative para receber pedidos proximos.';
    case 'requesting-permission':
      return 'Solicitando permissao de localizacao...';
    case 'permission-denied':
      return 'Permissao de localizacao negada. Habilite nas configuracoes para receber pedidos Express.';
    case 'capturing':
      return 'Localizando voce...';
    case 'active': {
      if (!lastCapturedAt) return 'Recebendo pedidos proximos.';
      const secondsAgo = Math.max(0, Math.round((Date.now() - lastCapturedAt.getTime()) / 1000));
      return `Recebendo pedidos proximos. Ultima atualizacao: ha ${secondsAgo}s.`;
    }
    case 'stale':
      return 'Sua posicao esta desatualizada. Tentando atualizar...';
    case 'unavailable':
      return 'Nao foi possivel obter sua localizacao. Verifique GPS e tente de novo.';
  }
}

export function ExpressAvailabilityCard({ variant = 'default' }: ExpressAvailabilityCardProps) {
  const { status, geoActive, lastCapturedAt, toggle, forceCapture, openSettings } = useExpressAvailability();
  const badge = badgeFor(status);
  const busy = status === 'requesting-permission' || status === 'capturing';

  if (variant === 'compact') {
    return (
      <View style={styles.compactCard}>
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
          disabled={busy}
          accessibilityRole="switch"
          accessibilityState={{ checked: geoActive, busy }}
          accessibilityLabel={`Express ${geoActive ? 'ativo' : 'desligado'}`}
          trackColor={{ false: colors.neutral[300], true: colors.primary.default }}
          thumbColor="#FFFFFF"
        />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Zap color={colors.primary.default} size={20} />
          <Text variant="titleSm">Disponivel para Express</Text>
        </View>

        <Switch
          value={geoActive}
          onValueChange={toggle}
          disabled={busy}
          accessibilityRole="switch"
          accessibilityState={{ checked: geoActive, busy }}
          trackColor={{ false: colors.neutral[300], true: colors.primary.default }}
          thumbColor="#FFFFFF"
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
        {messageFor(status, lastCapturedAt)}
      </Text>

      {status === 'permission-denied' ? (
        <Pressable style={styles.actionButton} onPress={() => void openSettings()}>
          <Text variant="labelLg" color={colors.primary.default}>
            Abrir configuracoes
          </Text>
        </Pressable>
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
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[1],
  },
});
