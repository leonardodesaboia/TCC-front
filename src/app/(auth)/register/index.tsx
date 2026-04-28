import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Badge, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

function OptionCard({
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
        styles.card,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, disabled && styles.iconCircleDisabled]}>
          {icon}
        </View>
        {badge ? <Badge label={badge} variant={disabled ? 'muted' : 'default'} /> : null}
      </View>
      <View style={styles.cardBody}>
        <Text variant="titleSm" color={disabled ? colors.neutral[400] : colors.neutral[900]}>
          {title}
        </Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {description}
        </Text>
      </View>
      {!disabled ? (
        <ArrowRight color={colors.neutral[400]} size={20} />
      ) : null}
    </Pressable>
  );
}

export default function RegisterChoiceScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="displayLg">Criar conta</Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            Escolha como deseja usar o AllSet.
          </Text>
        </View>

        <View style={styles.options}>
          <OptionCard
            title="Sou cliente"
            description="Encontre profissionais e contrate serviços para sua casa."
            icon={<UserRound color={colors.primary.default} size={24} />}
            onPress={() => router.push('/(auth)/register/client')}
          />
          <OptionCard
            title="Sou profissional"
            description="Cadastre seus serviços e receba pedidos de clientes."
            icon={<BriefcaseBusiness color={colors.primary.default} size={24} />}
            onPress={() => router.push('/(auth)/register/professional')}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySm" color={colors.neutral[500]}>
            Já tem conta?
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text variant="titleSm" color={colors.primary.default}>
              Entrar
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[8],
  },
  header: {
    gap: spacing[2],
  },
  options: {
    gap: spacing[3],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  cardDisabled: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
  },
  cardPressed: {
    backgroundColor: colors.neutral[100],
  },
  cardTop: {
    gap: spacing[2],
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.light,
  },
  iconCircleDisabled: {
    backgroundColor: colors.neutral[200],
  },
  cardBody: {
    flex: 1,
    gap: spacing[1],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
});
