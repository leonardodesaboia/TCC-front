import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Globe, Lock, Trash2 } from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Divider, Text } from '@/components/ui';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/lib/hooks/useNotifications';
import { useDeleteAccount } from '@/lib/hooks/useUsers';
import { colors, radius, spacing } from '@/theme';

interface ToggleItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function ToggleItem({ icon, label, description, value, onValueChange }: ToggleItemProps) {
  return (
    <View style={styles.menuItem}>
      {icon}
      <View style={styles.menuLabel}>
        <Text variant="bodySm">{label}</Text>
        {description ? <Text variant="labelSm" color={colors.neutral[500]}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.neutral[300], true: colors.primary.default }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function NavItem({ icon, label, onPress, danger }: NavItemProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
      {icon}
      <Text variant="bodySm" color={danger ? colors.error : colors.neutral[900]} style={styles.menuLabelFlex}>
        {label}
      </Text>
      <ChevronRight color={danger ? colors.error : colors.neutral[300]} size={18} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const deleteAccount = useDeleteAccount();

  if (preferencesQuery.isLoading) {
    return <LoadingScreen message="Carregando configurações..." />;
  }

  if (preferencesQuery.isError) {
    return <ErrorState message="Não foi possível carregar as configurações." onRetry={() => preferencesQuery.refetch()} />;
  }

  const notificationsEnabled = preferencesQuery.data?.notificationsEnabled ?? true;

  return (
    <Screen edges={['top']}>
      <Header title="Configurações" showBack />

      {/* Notifications */}
      <View style={styles.section}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.sectionTitle}>
          NOTIFICAÇÕES
        </Text>
        <ToggleItem
          icon={<Bell color={colors.neutral[600]} size={20} />}
          label="Notificações do app"
          description="Controla notificações relacionadas a pedidos e mensagens"
          value={notificationsEnabled}
          onValueChange={(value) => updatePreferences.mutate(value)}
        />
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.sectionTitle}>
          CONTA
        </Text>
        <NavItem
          icon={<Lock color={colors.neutral[600]} size={20} />}
          label="Recuperar senha"
          onPress={() => router.push('/(auth)/forgot-password')}
        />
        <Divider />
        <NavItem
          icon={<Globe color={colors.neutral[600]} size={20} />}
          label="Idioma"
          onPress={() => {}}
        />
      </View>

      {/* Danger zone */}
      <View style={styles.section}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.sectionTitle}>
          ZONA DE PERIGO
        </Text>
        <NavItem
          icon={<Trash2 color={colors.error} size={20} />}
          label="Excluir minha conta"
          onPress={() => deleteAccount.mutate()}
          danger
        />
      </View>

      <Text variant="labelSm" color={colors.neutral[400]} style={styles.version}>
        AllSet v1.0.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: { paddingVertical: spacing[2] },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  menuLabel: { flex: 1, gap: 2 },
  menuLabelFlex: { flex: 1 },
  pressed: { opacity: 0.6 },
  version: { textAlign: 'center', paddingTop: spacing[2] },
});
