import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { colors, layout, radius, shadows, spacing } from '@/theme';

function RegisterOptionCard({
  title,
  description,
  icon,
  disabled = false,
  badge,
  onPress,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  disabled?: boolean;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        disabled && styles.optionCardDisabled,
        pressed && !disabled && styles.optionCardPressed,
      ]}
    >
      <View style={styles.optionHeader}>
        <View style={styles.optionIcon}>{icon}</View>
        {badge ? (
          <View style={[styles.badge, disabled && styles.badgeMuted]}>
            <Text variant="labelSm" color={disabled ? colors.neutral[500] : colors.primary.default}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.optionContent}>
        <Text variant="titleSm" color={disabled ? colors.neutral[500] : colors.secondary.default}>
          {title}
        </Text>
        <Text color={colors.neutral[500]}>{description}</Text>
      </View>
      {!disabled ? <ArrowRight color={colors.primary.default} size={20} /> : null}
    </Pressable>
  );
}

export default function RegisterChoiceScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <Text variant="labelLg" color={colors.primary.default}>
            CADASTRO
          </Text>
          <Text variant="displayMd" style={styles.title}>
            Escolha o perfil que faz sentido para sua jornada.
          </Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            O fluxo inicial do rewrite cobre a experiência de cliente. O profissional fica preparado para a próxima etapa.
          </Text>
        </View>

        <View style={styles.options}>
          <RegisterOptionCard
            title="Cliente"
            description="Encontre serviços, acompanhe pedidos e gerencie seus agendamentos."
            icon={<UserRound color={colors.primary.default} size={24} />}
            onPress={() => router.push('/(auth)/register/client')}
          />
          <RegisterOptionCard
            title="Profissional"
            description="Cadastre seus serviços, receba pedidos e administre sua agenda."
            icon={<BriefcaseBusiness color={colors.neutral[500]} size={24} />}
            disabled
            badge="Em breve"
          />
        </View>

        <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.backLink}>
          <Text variant="labelLg" color={colors.primary.default}>
            Voltar para login
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    gap: layout.sectionGap,
  },
  hero: {
    gap: spacing[3],
  },
  title: {
    color: colors.secondary.default,
  },
  options: {
    gap: spacing[4],
  },
  optionCard: {
    gap: spacing[4],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
    ...shadows.md,
  },
  optionCardPressed: {
    opacity: 0.88,
  },
  optionCardDisabled: {
    backgroundColor: colors.neutral[100],
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },
  badge: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  badgeMuted: {
    backgroundColor: colors.neutral[200],
  },
  optionContent: {
    gap: spacing[2],
  },
  backLink: {
    alignSelf: 'center',
  },
});
